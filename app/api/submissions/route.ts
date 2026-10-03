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
        categoryRecords: true,
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
        jenisKelamin: r.jenisKelamin,
        tanggalLahir: r.tanggalLahir,
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

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Process uploaded excel files and attach category records to target Responden
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

    // Cari responden target jika dikirim
    let responden = null;
    if (respondenId) {
      responden = await prisma.responden.findUnique({ where: { id: respondenId } });
    }
    if (!responden && respondenNik) {
      responden = await prisma.responden.findUnique({ where: { nik: respondenNik } });
    }

    // Filter file entries from FormData
    const rawFileEntries: { step: number; file: File }[] = [];
    for (const [key, value] of formData.entries()) {
      if (typeof value === "object" && value !== null && "name" in value && "size" in value) {
        const file = value as File;
        const keyMatch = key.match(/^(?:file|category|indicator|fileCategory|fileIndicator)[_-]?(\d+)$/i);
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
    const allCategoryRecords: ParsedIndicatorRecordData[] = [];

    for (const entry of rawFileEntries) {
      const arrayBuffer = await entry.file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const parseResult = parseAndValidateExcelFile(buffer, entry.step, entry.file.name);

      if (parseResult.errors.length > 0) {
        aggregatedErrors.push(...parseResult.errors);
      }

      if (entry.step === 1 && parseResult.respondenRecords && parseResult.respondenRecords.length > 0) {
        const respData = parseResult.respondenRecords[0];
        if (respData) {
          if (!respData.nik || respData.nik === "-" || respData.nik.trim().length < 8) {
            aggregatedErrors.push({
              file: entry.file.name,
              step: 1,
              row: 1,
              field: "NIK",
              message: "NIK pada file Excel Data Responden (Kategori 1) wajib diisi dan valid.",
            });
          } else {
            const cleanNik = respData.nik.trim();
            if (responden) {
              await prisma.responden.update({
                where: { id: responden.id },
                data: {
                  ...(respData.nama && { nama: respData.nama }),
                  nik: cleanNik,
                  ...(respData.jenisKelamin && { jenisKelamin: respData.jenisKelamin.toLowerCase().includes("perempuan") ? "PEREMPUAN" : "LAKI_LAKI" }),
                  ...(respData.kabupatenKota && { kabupatenKota: respData.kabupatenKota }),
                  ...(respData.kecamatan && { kecamatan: respData.kecamatan }),
                  ...(respData.cabangOlahraga && { cabangOlahraga: respData.cabangOlahraga }),
                  ...(respData.nomorTelepon && { nomorTelepon: respData.nomorTelepon }),
                },
              });
            } else {
              const existing = await prisma.responden.findUnique({ where: { nik: cleanNik } });
              if (existing) {
                responden = await prisma.responden.update({
                  where: { id: existing.id },
                  data: {
                    ...(respData.nama && { nama: respData.nama }),
                    ...(respData.jenisKelamin && { jenisKelamin: respData.jenisKelamin.toLowerCase().includes("perempuan") ? "PEREMPUAN" : "LAKI_LAKI" }),
                    ...(respData.kabupatenKota && { kabupatenKota: respData.kabupatenKota }),
                    ...(respData.kecamatan && { kecamatan: respData.kecamatan }),
                    ...(respData.cabangOlahraga && { cabangOlahraga: respData.cabangOlahraga }),
                    ...(respData.nomorTelepon && { nomorTelepon: respData.nomorTelepon }),
                  },
                });
              } else {
                responden = await prisma.responden.create({
                  data: {
                    nik: cleanNik,
                    nama: respData.nama || "Tanpa Nama",
                    jenisKelamin: respData.jenisKelamin?.toLowerCase().includes("perempuan") ? "PEREMPUAN" : "LAKI_LAKI",
                    tanggalLahir: respData.tanggalLahir ? new Date(respData.tanggalLahir) : new Date(),
                    kabupatenKota: respData.kabupatenKota || "Kalimantan Timur",
                    kecamatan: respData.kecamatan || "-",
                    cabangOlahraga: respData.cabangOlahraga || "-",
                    nomorTelepon: respData.nomorTelepon || "-",
                    userId: payload.id,
                  },
                });
              }
            }
          }
        }
      }

      const parsedRecs = parseResult.categoryRecords || parseResult.indicatorRecords || [];
      if (parsedRecs.length > 0) {
        allCategoryRecords.push(...parsedRecs);
      }
    }

    if (!responden) {
      return NextResponse.json(
        { error: "Responden tidak ditemukan. Silakan pilih atau buat data responden terlebih dahulu." },
        { status: 400 }
      );
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

    // Save category records attached to responden
    await prisma.categoryRecord.createMany({
      data: allCategoryRecords.map((r) => ({
        categoryId: r.categoryId || r.indicatorId,
        namaKegiatan: r.namaKegiatan,
        cabangOlahraga: r.cabangOlahraga,
        tingkatPenyelenggaraan: r.tingkatPenyelenggaraan,
        sumberPendanaan: r.sumberPendanaan,
        medali: r.medali,
        uraianCapaian: r.uraianCapaian,
        respondenId: responden.id,
      })),
    });

    await prisma.auditLog.create({
      data: {
        userId: payload.id,
        action: "UPLOAD_CATEGORIES",
        entity: "Responden",
        entityId: responden.id,
      },
    });

    return NextResponse.json(
      { success: true, respondenId: responden.id, message: "Data kategori berhasil disimpan." },
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


