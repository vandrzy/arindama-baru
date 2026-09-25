import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyJwtToken } from "@/lib/auth";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

// Allowed Excel extensions & MIME types
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

function getCellValue(row: any[], index: number): string {
  if (index === -1 || !row || index >= row.length) return "";
  const val = row[index];
  if (val === null || val === undefined) return "";
  return String(val).trim();
}

// GET: List all submissions with identity & indicator records
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
    const tahun = searchParams.get("tahun");

    const targetUserId = payload.role === "RESPONDEN" ? payload.id : filterUserId || undefined;

    const submissions = await prisma.submission.findMany({
      where: {
        ...(targetUserId && { userId: targetUserId }),
        ...(tahun && { tahunSurvei: parseInt(tahun) }),
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
        respondenIdentity: true,
        indicatorRecords: true,
        validationEvidences: true,
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

// POST: Create new submission by parsing Excel files directly into database tables
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
    const tahunRaw = formData.get("tahunSurvei");
    const tahunSurvei = tahunRaw ? parseInt(tahunRaw as string) : new Date().getFullYear();

    const validation = submissionSchema.safeParse({ tahunSurvei });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi metadata gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const fileEntries: { step: number; file: File }[] = [];

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

          fileEntries.push({
            step: parseInt(keyMatch[1]),
            file,
          });
        }
      }
    }

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada file Excel yang diunggah" },
        { status: 400 }
      );
    }

    let parsedIdentity: any = null;
    const parsedIndicatorRecords: any[] = [];

    for (const item of fileEntries) {
      const arrayBuffer = await item.file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        return NextResponse.json(
          { error: `File '${item.file.name}' tidak memiliki sheet yang valid.` },
          { status: 400 }
        );
      }

      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (!rawRows || rawRows.length < 2) {
        return NextResponse.json(
          { error: `File '${item.file.name}' kosong atau tidak memiliki data.` },
          { status: 400 }
        );
      }

      const headerRow = rawRows[0].map((h: any) => String(h || "").trim().toLowerCase());
      const dataRows = rawRows.slice(1);

      if (item.step === 0) {
        const idxNama = headerRow.findIndex((h) => h.includes("nama"));
        const idxJenisKelamin = headerRow.findIndex((h) => h.includes("jenis kelamin") || h.includes("kelamin"));
        const idxTanggalLahir = headerRow.findIndex((h) => h.includes("tanggal lahir") || h.includes("lahir"));
        const idxUmur = headerRow.findIndex((h) => h.includes("umur") || h.includes("usia"));
        const idxKabKota = headerRow.findIndex((h) => h.includes("kabupaten") || h.includes("kota"));
        const idxKecamatan = headerRow.findIndex((h) => h.includes("kecamatan"));
        const idxPekerjaan = headerRow.findIndex((h) => h.includes("pekerjaan") || h.includes("jabatan"));
        const idxTelepon = headerRow.findIndex((h) => h.includes("telepon") || h.includes("whatsapp") || h.includes("hp"));

        const firstDataRow = dataRows.find(
          (r) => r && r.some((c: any) => c !== null && c !== undefined && String(c).trim() !== "")
        );

        if (!firstDataRow) {
          return NextResponse.json(
            { error: `File Identitas Responden (${item.file.name}) tidak memiliki data baris yang terisi.` },
            { status: 400 }
          );
        }

        const namaLengkap = getCellValue(firstDataRow, idxNama);
        const jenisKelamin = getCellValue(firstDataRow, idxJenisKelamin);
        const tanggalLahir = getCellValue(firstDataRow, idxTanggalLahir);
        const umur = getCellValue(firstDataRow, idxUmur);
        const kabupatenKotaAsal = getCellValue(firstDataRow, idxKabKota);
        const kecamatan = getCellValue(firstDataRow, idxKecamatan);
        const pekerjaanJabatan = getCellValue(firstDataRow, idxPekerjaan);
        const nomorTelepon = getCellValue(firstDataRow, idxTelepon);

        if (!namaLengkap || !jenisKelamin || !tanggalLahir || !umur || !kabupatenKotaAsal || !kecamatan || !pekerjaanJabatan || !nomorTelepon) {
          return NextResponse.json(
            { error: `Validasi Identitas Gagal: Terdapat data wajib yang belum terisi di file '${item.file.name}'.` },
            { status: 400 }
          );
        }

        parsedIdentity = {
          namaLengkap,
          jenisKelamin,
          tanggalLahir,
          umur,
          kabupatenKotaAsal,
          kecamatan,
          pekerjaanJabatan,
          nomorTelepon,
        };
      } else {
        const idxKegiatan = headerRow.findIndex((h) => h.includes("nama kegiatan") || h.includes("kejuaraan"));
        const idxCabor = headerRow.findIndex((h) => h.includes("cabang") || h.includes("cabor"));
        const idxTingkat = headerRow.findIndex((h) => h.includes("tingkat"));
        const idxSumber = headerRow.findIndex((h) => h.includes("sumber") || h.includes("pendanaan"));
        const idxMedali = headerRow.findIndex((h) => h.includes("medali")); // Optional!
        const idxUraian = headerRow.findIndex((h) => h.includes("uraian") || h.includes("capaian"));

        for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
          const row = dataRows[rIdx];
          if (!row || !row.some((c: any) => c !== null && c !== undefined && String(c).trim() !== "")) {
            continue;
          }

          const namaKegiatan = getCellValue(row, idxKegiatan);
          const cabangOlahraga = getCellValue(row, idxCabor);
          const tingkatPenyelenggaraan = getCellValue(row, idxTingkat);
          const sumberPendanaan = getCellValue(row, idxSumber);
          const medali = idxMedali !== -1 ? getCellValue(row, idxMedali) : null;
          const uraianCapaian = getCellValue(row, idxUraian);

          const displayRow = rIdx + 2;

          if (!namaKegiatan || !cabangOlahraga || !tingkatPenyelenggaraan || !sumberPendanaan || !uraianCapaian) {
            return NextResponse.json(
              {
                error: `Validasi Indikator ${item.step} Gagal: Baris ke-${displayRow} pada file '${item.file.name}' memiliki kolom wajib yang belum terisi.`,
              },
              { status: 400 }
            );
          }

          parsedIndicatorRecords.push({
            indicatorId: item.step,
            namaKegiatan,
            cabangOlahraga,
            tingkatPenyelenggaraan,
            sumberPendanaan,
            medali: medali || null,
            uraianCapaian,
          });
        }
      }
    }

    if (!parsedIdentity) {
      return NextResponse.json(
        { error: "Form Identitas Responden wajib diikutsertakan dalam pengiriman." },
        { status: 400 }
      );
    }

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          noRegistrasi: crypto.randomUUID(),
          userId: payload.id,
          tahunSurvei: data.tahunSurvei,
          totalIndikatorTerisi: new Set(parsedIndicatorRecords.map((r) => r.indicatorId)).size,
          respondenIdentity: {
            create: parsedIdentity,
          },
          indicatorRecords: {
            create: parsedIndicatorRecords,
          },
        },
        include: {
          respondenIdentity: true,
          indicatorRecords: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: payload.id,
          action: "CREATE_SUBMISSION",
          entity: "Submission",
          entityId: sub.id,
        },
      });

      return sub;
    });

    return NextResponse.json(
      { success: true, submissionId: submission.id, submission },
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
