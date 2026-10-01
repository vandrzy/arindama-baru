import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken, hashPassword } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Helper for checking if request is from ADMIN
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;

  const payload = verifyJwtToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}

const createUserSchema = z.object({
  nip: z.string().length(18, "NIP harus terdiri dari 18 digit"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  nama: z.string().min(3, "Nama wajib diisi"),
  role: z.enum(["ADMIN", "OPERATOR"]).default("OPERATOR"),
  jabatan: z.string().min(2, "Jabatan wajib diisi"),
  kabupatenKota: z.string().min(3, "Kabupaten/Kota wajib diisi"),
  instansi: z.string().min(2, "Instansi wajib diisi"),
  nomorTelepon: z.string().optional().default(""),
});

// GET /api/users - List users with pagination & search
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Akses ditolak. Membutuhkan hak akses Admin." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * limit;

    const whereCondition = search
      ? {
          OR: [
            { nama: { contains: search } },
            { nip: { contains: search } },
            { email: { contains: search } },
            { jabatan: { contains: search } },
            { instansi: { contains: search } },
            { kabupatenKota: { contains: search } },
            { nomorTelepon: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereCondition,
        select: {
          id: true,
          nip: true,
          email: true,
          nama: true,
          role: true,
          jabatan: true,
          kabupatenKota: true,
          instansi: true,
          nomorTelepon: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat mengambil data akun." },
      { status: 500 }
    );
  }
}

// POST /api/users - Create user by admin
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Akses ditolak. Membutuhkan hak akses Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { nip, email, password, nama, role, jabatan, kabupatenKota, instansi, nomorTelepon } = validation.data;

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ nip }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.nip === nip
              ? "NIP sudah terdaftar."
              : "Email sudah terdaftar.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        nip,
        email,
        password: hashedPassword,
        nama,
        role,
        jabatan,
        kabupatenKota,
        instansi,
        nomorTelepon: nomorTelepon || "",
      },
      select: {
        id: true,
        nip: true,
        email: true,
        nama: true,
        role: true,
        jabatan: true,
        kabupatenKota: true,
        instansi: true,
        nomorTelepon: true,
        createdAt: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "CREATE_USER",
        entity: "User",
        entityId: newUser.id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { createdUser: newUser.nip, role: newUser.role },
      },
    });

    return NextResponse.json(
      { success: true, user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat membuat akun baru." },
      { status: 500 }
    );
  }
}
