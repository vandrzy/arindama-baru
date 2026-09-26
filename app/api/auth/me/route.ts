import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan" },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Sesi kadaluarsa atau tidak valid" },
        { status: 401 }
      );
    }

    const userRaw = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        email: true,
        nama: true,
        role: true,
        jabatan: true,
        instansi: true,
        kabupatenKota: true,
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            respondenIdentity: {
              select: {
                kabupatenKotaAsal: true,
              },
            },
          },
        },
      },
    });

    if (!userRaw) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" },
        { status: 401 }
      );
    }

    const { submissions, ...userBase } = userRaw;
    const dbKabupaten = userBase.kabupatenKota || submissions[0]?.respondenIdentity?.kabupatenKotaAsal || "";

    const user = {
      ...userBase,
      kabupatenKota: dbKabupaten,
    };

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
