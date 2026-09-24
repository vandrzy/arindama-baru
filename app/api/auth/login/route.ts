import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signJwtToken } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { username, email, password } = validation.data;

    // Find user by username AND email
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username, Email, atau Password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Username, Email, atau Password salah" },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Generate JWT token (Payload: id, email, role | Expiration: 2h)
    const token = signJwtToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Prepare HTTP response
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nama: user.nama,
        role: user.role,
        jabatan: user.jabatan,
        instansi: user.instansi,
      },
    });

    // Set HTTP-Only Secure Cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7200, // 2 jam (7200 detik)
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

