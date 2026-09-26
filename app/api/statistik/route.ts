import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { z } from "zod";
import { getAdminFiltersData, getStatistikData } from "@/lib/services/statistikService";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  kota: z.string().optional().transform((v) => (v ? v.trim() : "")),
  instansi: z.string().optional().transform((v) => (v ? v.trim() : "")),
  userId: z.string().optional().transform((v) => (v ? v.trim() : "")),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    // Get user details
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, nama: true, email: true, role: true, kabupatenKota: true, instansi: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Validate query parameters with Zod
    const { searchParams } = new URL(request.url);
    const parsedQuery = querySchema.safeParse({
      kota: searchParams.get("kota") || undefined,
      instansi: searchParams.get("instansi") || undefined,
      userId: searchParams.get("userId") || undefined,
    });

    const { kota: paramKota, instansi: paramInstansi, userId: paramUserId } = parsedQuery.success
      ? parsedQuery.data
      : { kota: "", instansi: "", userId: "" };

    // Prepare Admin UI Filter Options dynamically using SQL pushdown
    const adminFiltersData = currentUser.role === "ADMIN"
      ? await getAdminFiltersData(paramKota, paramInstansi)
      : { listKota: [], listInstansi: [], listResponden: [] };

    // Process user's submissions data via service
    const data = await getStatistikData({
      currentUser,
      paramKota,
      paramInstansi,
      paramUserId,
    });

    return NextResponse.json({
      success: true,
      currentUser: {
        id: currentUser.id,
        nama: currentUser.nama,
        email: currentUser.email,
        role: currentUser.role,
        kabupatenKota: currentUser.kabupatenKota,
        instansi: currentUser.instansi,
      },
      adminFiltersData,
      data,
    });
  } catch (error) {
    console.error("Get statistik error:", error);
    return NextResponse.json({ error: "Gagal mengambil data statistik." }, { status: 500 });
  }
}

