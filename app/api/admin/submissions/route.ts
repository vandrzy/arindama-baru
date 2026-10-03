import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Get all respondens with user info & records (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const respondens = await prisma.responden.findMany({
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
            jabatan: true,
            instansi: true,
            kabupatenKota: true,
          },
        },
        categoryRecords: {
          orderBy: { categoryId: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const submissions = respondens.map((r) => {
      const respondenObj = {
        id: r.id,
        nik: r.nik,
        nama: r.nama,
        kabupatenKota: r.kabupatenKota,
        kecamatan: r.kecamatan,
        cabangOlahraga: r.cabangOlahraga,
        nomorTelepon: r.nomorTelepon,
      };

      const catRecords = r.categoryRecords.map((rec) => ({
        ...rec,
        indicatorId: rec.categoryId,
        responden: respondenObj,
      }));

      return {
        ...r,
        noRegistrasi: r.id,
        responden: respondenObj,
        totalKategoriTerisi: new Set(r.categoryRecords.map((i) => i.categoryId)).size,
        totalIndikatorTerisi: new Set(r.categoryRecords.map((i) => i.categoryId)).size,
        categoryRecords: catRecords,
        indicatorRecords: catRecords,
      };
    });

    return NextResponse.json({
      success: true,
      submissions,
      totalSubmissions: respondens.length,
    });
  } catch (error) {
    console.error("Admin get submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

