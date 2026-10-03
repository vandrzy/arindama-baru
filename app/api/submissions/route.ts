import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyJwtToken } from "@/lib/auth";
import { parseAndValidateExcelFile, ValidationErrorDetail, ParsedIndicatorRecordData } from "@/lib/services/excelService";

export const dynamic = "force-dynamic";

const ALLOWED_EXCEL_EXTENSIONS = [".xlsx", ".xls"];
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/wps-office.xlsx",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit per file

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXCEL_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidType = !file.type || ALLOWED_EXCEL_TYPES.includes(file.type);
  return hasValidExt && hasValidType;
}

const submissionSchema = z.object({
  tahunSurvei: z.number().int().min(2020).max(2100).default(2024),
});

// GET: List all respondens with indicator records & validation evidences (aliased as submissions for backward compatibility)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan atau kadaluarsa. Silakan login kembali." },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Sesi tidak valid atau telah kadaluarsa. Silakan login kembali." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filterUserId = searchParams.get("userId");

    const targetUserId = payload.role === "OPERATOR" ? payload.id : filterUserId || undefined;

    const respondens = await prisma.responden.findMany({
      where: {
        ...(targetUserId && { userId: targetUserId }),
      },
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
        indicatorRecords: true,
        validationEvidences: true,
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

      return {
        ...r,
        noRegistrasi: r.id,
        responden: respondenObj,
        totalIndikatorTerisi: new Set(r.indicatorRecords.map((i) => i.indicatorId)).size,
        indicatorRecords: r.indicatorRecords.map((rec) => ({
          ...rec,
          responden: respondenObj,
        })),
      };
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

// POST: Process uploaded excel files and attach indicator records to target Responden
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan atau kadaluarsa. Silakan login kembali." },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Sesi tidak valid atau telah kadaluarsa. Silakan login kembali." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const respondenId = formData.get("respondenId") as string | null;
    const respondenNik = formData.get("respondenNik") as string | null;

    // Cari responden target
    let responden = null;
    if (respondenId) {
      responden = await prisma.responden.findUnique({ where: { id: respondenId } });
    }
    if (!responden && respondenNik) {
      responden = await prisma.responden.findUnique({ where: { nik: respondenNik } });
    }

    if (!responden) {
      return NextResponse.json(
        { error: "Responden tidak ditemukan. Silakan pilih atau buat data responden terlebih dahulu." },
        { status: 400 }
      );
    }

    // Filter file entries from FormData
    const rawFileEntries: { step: number; file: File }[] = [];
    for (const [key, value] of formData.entries()) {
      if (typeof value === "object" && value !== null && "name" in value && "size" in value) {
        const file = value as File;
        const keyMatch = key.match(/^(?:file|indicator|fileIndicator)[_-]?(\d+)$/i);
        if (keyMatch && file.size > 0) {
          if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
              { error: `File '${file.name}' melebihi batas ukuran maksimum (10 MB)` },
              { status: 400 }
            );
          }

          if (!isExcelFile(file)) {
            return NextResponse.json(
              { error: `File '${file.name}' bukan file Excel yang valid (.xlsx / .xls)` },
              { status: 400 }
            );
          }

          rawFileEntries.push({
            step: parseInt(keyMatch[1]),
            file,
          });
        }
      }
    }

    if (rawFileEntries.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada file Excel yang diunggah" },
        { status: 400 }
      );
    }

    rawFileEntries.sort((a, b) => a.step - b.step);

    const aggregatedErrors: ValidationErrorDetail[] = [];
    const allIndicatorRecords: ParsedIndicatorRecordData[] = [];

    for (const entry of rawFileEntries) {
      const arrayBuffer = await entry.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parseResult = parseAndValidateExcelFile(buffer, entry.step, entry.file.name);

      if (parseResult.errors.length > 0) {
        aggregatedErrors.push(...parseResult.errors);
      }

      if (parseResult.indicatorRecords.length > 0) {
        allIndicatorRecords.push(...parseResult.indicatorRecords);
      }
    }

    if (aggregatedErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validasi file Excel gagal",
          errors: aggregatedErrors,
        },
        { status: 400 }
      );
    }

    // Save indicator records attached to responden
    await prisma.indicatorRecord.createMany({
      data: allIndicatorRecords.map((r) => ({
        ...r,
        respondenId: responden.id,
      })),
    });

    await prisma.auditLog.create({
      data: {
        userId: payload.id,
        action: "UPLOAD_INDICATORS",
        entity: "Responden",
        entityId: responden.id,
      },
    });

    return NextResponse.json(
      { success: true, respondenId: responden.id, message: "Data indikator berhasil disimpan." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


