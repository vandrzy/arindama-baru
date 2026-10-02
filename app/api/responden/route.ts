import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JenisKelamin } from "@prisma/client";
import { z } from "zod";
import { verifyJwtToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const createRespondenSchema = z.object({
  nama: z.string().min(1, "Nama lengkap wajib diisi"),
  nik: z.string().min(16, "NIK wajib 16 digit"),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan", "LAKI_LAKI", "PEREMPUAN"]),
  tanggalLahir: z.string(),
  kabupatenKota: z.string().min(1, "Kabupaten/Kota wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  cabangOlahraga: z.string().min(1, "Cabang Olahraga / Afiliasi Organisasi wajib diisi"),
  nomorTelepon: z.string().min(1, "Nomor Telepon aktif wajib diisi"),
});

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search")?.trim() || "";
    const kabupatenKota = searchParams.get("kabupatenKota") || undefined;

    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    
    // Admin can see all, Operator can only see what they input
    if (payload.role === "OPERATOR") {
      whereCondition.userId = payload.id;
    }

    if (kabupatenKota) {
       whereCondition.kabupatenKota = kabupatenKota;
    }

    if (search) {
      whereCondition.OR = [
        { nama: { contains: search } },
        { nik: { contains: search } },
        { kecamatan: { contains: search } },
        { cabangOlahraga: { contains: search } },
      ];
    }

    const [responden, total] = await Promise.all([
      prisma.responden.findMany({
        where: whereCondition,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.responden.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      success: true,
      responden,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/responden error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createRespondenSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const existingNIK = await prisma.responden.findUnique({
      where: { nik: data.nik },
    });

    if (existingNIK) {
      return NextResponse.json(
        { error: "NIK sudah terdaftar." },
        { status: 409 }
      );
    }

    const jenisKelaminEnum =
      data.jenisKelamin === "Perempuan" || data.jenisKelamin === "PEREMPUAN"
        ? JenisKelamin.PEREMPUAN
        : JenisKelamin.LAKI_LAKI;

    const newResponden = await prisma.responden.create({
      data: {
        nik: data.nik,
        nama: data.nama,
        jenisKelamin: jenisKelaminEnum,
        tanggalLahir: new Date(data.tanggalLahir),
        kabupatenKota: data.kabupatenKota,
        kecamatan: data.kecamatan,
        cabangOlahraga: data.cabangOlahraga,
        nomorTelepon: data.nomorTelepon,
        userId: payload.id, // Save the ID of the user who created this respondent
      },
    });

    return NextResponse.json(
      { success: true, responden: newResponden },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/responden error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat menyimpan responden." },
      { status: 500 }
    );
  }
}
