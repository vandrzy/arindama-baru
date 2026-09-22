import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema untuk submission
const submissionSchema = z.object({
  userId: z.string().cuid(),
  tahunSurvei: z.number().int().min(2020).max(2100),
  namaLengkap: z.string().min(3),
  umur: z.number().int().min(10).max(120),
  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  kabupatenKota: z.string().min(3),
  kecamatan: z.string().min(3),
  pekerjaan: z.string().min(3),
  nomorTelepon: z.string().min(8),
  answers: z.array(z.object({
    indicatorId: z.number().int(),
    indicatorTitle: z.string(),
    namaKegiatan: z.string(),
    cabangOlahraga: z.string(),
    tingkatPenyelenggaraan: z.enum(["NASIONAL", "INTERNASIONAL"]).optional(),
    sumberPendanaan: z.enum(["APBD", "APBN", "SWASTA_SPONSORSHIP", "KOMBINASI", "MANDIRI"]).optional(),
    capaianPrestasi: z.string().optional(),
    medaliEmas: z.number().int().default(0),
    medaliPerak: z.number().int().default(0),
    medaliPerunggu: z.number().int().default(0),
    jumlahPeserta: z.number().int().optional(),
    nomorSuratTugas: z.string().optional(),
    uraianKegiatan: z.string(),
    tingkatWilayah: z.enum(["KABUPATEN_KOTA", "PROVINSI", "NASIONAL", "INTERNASIONAL"]).optional(),
    bobotNilai: z.number().int().default(1),
    fileBuktiName: z.string().optional(),
    fileBuktiSize: z.number().int().optional(),
    fileBuktiHash: z.string().optional(),
  })),
});

// GET: List all submissions (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const tahun = searchParams.get("tahun");

    const submissions = await prisma.submission.findMany({
      where: {
        ...(userId && { userId }),
        ...(status && { status: status as any }),
        ...(tahun && { tahunSurvei: parseInt(tahun) }),
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            role: true,
          },
        },
        answers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = submissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Create submission with answers
    const submission = await prisma.submission.create({
      data: {
        userId: data.userId,
        tahunSurvei: data.tahunSurvei,
        namaLengkap: data.namaLengkap,
        umur: data.umur,
        jenisKelamin: data.jenisKelamin,
        kabupatenKota: data.kabupatenKota,
        kecamatan: data.kecamatan,
        pekerjaan: data.pekerjaan,
        nomorTelepon: data.nomorTelepon,
        status: "TERKIRIM",
        totalIndikatorTerisi: data.answers.length,
        answers: {
          create: data.answers,
        },
      },
      include: {
        answers: true,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: "CREATE_SUBMISSION",
        entity: "Submission",
        entityId: submission.id,
      },
    });

    return NextResponse.json(
      { success: true, submission },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
