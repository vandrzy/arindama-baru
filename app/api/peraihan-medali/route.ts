import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { RecordStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

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
        { error: "Sesi kadaluarsa atau tidak valid." },
        { status: 401 }
      );
    }

    // Ambil detail pengguna aktif dari DB
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        kabupatenKota: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    let lokasi = searchParams.get("lokasi")?.trim() || "";
    const medaliParam = searchParams.get("medali")?.trim() || "";
    const tingkatPenyelenggaraanParam = searchParams.get("tingkatPenyelenggaraan")?.trim() || "";
    const tingkatanParam = searchParams.get("tingkatan")?.trim() || "";

    // Batasan Wilayah berdasarkan Role:
    // Operator dipaksa hanya melihat domisili mereka
    if (currentUser.role === "OPERATOR") {
      lokasi = currentUser.kabupatenKota || "";
    }

    // Bangun filter Prisma untuk IndicatorRecord
    // Syarat Mutlak 1: Hanya Indikator 1 (Pelajar) & Indikator 6 (Atlet)
    let indicatorIds = [1, 6];
    if (tingkatanParam.toLowerCase() === "pelajar") {
      indicatorIds = [1];
    } else if (tingkatanParam.toLowerCase() === "atlet") {
      indicatorIds = [6];
    }

    // Syarat Mutlak 2: Hanya status SAH / SAH_TERVERIFIKASI / DISETUJUI
    const validStatuses: RecordStatus[] = [
      RecordStatus.SAH_TERVERIFIKASI,
      RecordStatus.SAH,
      RecordStatus.DISETUJUI,
    ];

    const whereClause: any = {
      indicatorId: { in: indicatorIds },
      status: { in: validStatuses },
      medali: {
        not: null,
      },
    };

    // Filter Medali Spesifik (Emas, Perak, Perunggu)
    if (medaliParam && medaliParam.toLowerCase() !== "semua") {
      whereClause.medali = {
        equals: medaliParam,
      };
    } else {
      // Pastikan string medali tidak kosong
      whereClause.AND = [
        ...(whereClause.AND || []),
        { medali: { not: "" } },
      ];
    }

    // Filter Tingkat Penyelenggaraan (Provinsi, Nasional, Internasional)
    if (
      tingkatPenyelenggaraanParam &&
      tingkatPenyelenggaraanParam.toLowerCase() !== "semua"
    ) {
      whereClause.tingkatPenyelenggaraan = {
        contains: tingkatPenyelenggaraanParam,
      };
    }

    // Filter Lokasi (Kabupaten / Kota)
    if (
      lokasi &&
      lokasi.toLowerCase() !== "kalimantan timur" &&
      lokasi.toLowerCase() !== "semua"
    ) {
      // Bersihkan awalan "Kota " atau "Kab. " jika perlu untuk fleksibilitas pencarian
      const cleanLokasi = lokasi.replace(/^(Kota|Kab\.|Kabupaten)\s+/i, "").trim();
      whereClause.responden = {
        kabupatenKota: {
          contains: cleanLokasi,
        },
      };
    }

    // Filter Pencarian Teks (Search Bar)
    if (search) {
      whereClause.OR = [
        { namaKegiatan: { contains: search } },
        { cabangOlahraga: { contains: search } },
        { respondenNik: { contains: search } },
        {
          responden: {
            nama: { contains: search },
          },
        },
        {
          responden: {
            nik: { contains: search },
          },
        },
      ];
    }

    // Query data indikator beserta data responden
    const records = await prisma.indicatorRecord.findMany({
      where: whereClause,
      include: {
        responden: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Ambil bukti fisik / berkas validasi yang terkait dengan recordId atau submissionId
    const recordIds = records.map((r) => r.id);
    const submissionIds = Array.from(new Set(records.map((r) => r.submissionId)));

    const evidences = await prisma.validationEvidence.findMany({
      where: {
        OR: [
          { recordId: { in: recordIds } },
          { submissionId: { in: submissionIds } },
        ],
      },
    });

    // Petakan bukti fisik ke record masing-masing
    const formattedRecords = records.map((rec) => {
      const recordEvidences = evidences.filter(
        (e) => e.recordId === rec.id || e.submissionId === rec.submissionId
      );
      return {
        id: rec.id,
        indicatorId: rec.indicatorId,
        kategori: rec.indicatorId === 1 ? "Pelajar" : "Atlet",
        namaKegiatan: rec.namaKegiatan,
        cabangOlahraga: rec.cabangOlahraga,
        tingkatPenyelenggaraan: rec.tingkatPenyelenggaraan,
        sumberPendanaan: rec.sumberPendanaan,
        medali: rec.medali,
        uraianCapaian: rec.uraianCapaian,
        status: rec.status,
        createdAt: rec.createdAt,
        submissionId: rec.submissionId,
        responden: rec.responden
          ? {
              nik: rec.responden.nik,
              nama: rec.responden.nama,
              kabupatenKota: rec.responden.kabupatenKota,
              kecamatan: rec.responden.kecamatan,
              cabangOlahraga: rec.responden.cabangOlahraga,
              nomorTelepon: rec.responden.nomorTelepon,
            }
          : {
              nik: rec.respondenNik || "-",
              nama: "Responden Tidak Ditemukan",
              kabupatenKota: "-",
              kecamatan: "-",
              cabangOlahraga: rec.cabangOlahraga || "-",
              nomorTelepon: "-",
            },
        evidences: recordEvidences.map((e) => ({
          id: e.id,
          fileName: e.fileName,
          fileUrl: e.fileUrl,
        })),
      };
    });

    // Hitung 2 Card Overview
    // 1. Total Medali Berstatus Sah (jumlah keseluruhan record medali yang sah & terverifikasi)
    const totalMedali = formattedRecords.length;

    // 2. Total Responden Meraih Medali (jumlah unik NIK responden dari record medali yang sah & terverifikasi)
    const uniqueRespondenNiks = new Set(
      formattedRecords
        .map((r) => r.responden.nik)
        .filter((nik) => nik && nik !== "-")
    );
    const totalResponden = uniqueRespondenNiks.size;

    return NextResponse.json({
      success: true,
      userRole: currentUser.role,
      userKabupatenKota: currentUser.kabupatenKota || "",
      summary: {
        totalMedali,
        totalResponden,
      },
      records: formattedRecords,
    });
  } catch (error: any) {
    console.error("GET /api/peraihan-medali error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat mengambil data peraihan medali.", details: error.message },
      { status: 500 }
    );
  }
}
