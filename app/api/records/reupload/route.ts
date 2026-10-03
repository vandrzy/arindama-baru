import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { parseAndValidateExcelFile, ParsedIndicatorRecordData } from "@/lib/services/excelService";

export const dynamic = "force-dynamic";

const ALLOWED_EXCEL_EXTENSIONS = [".xlsx", ".xls"];
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/wps-office.xlsx",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB Limit

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXCEL_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasValidType = !file.type || ALLOWED_EXCEL_TYPES.includes(file.type);
  return hasValidExt && hasValidType;
}

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const targetId = (formData.get("respondenId") as string | null) || (formData.get("submissionId") as string | null);
    const formType = formData.get("formType") as string | null;
    const respondenNik = formData.get("respondenNik") as string | null;

    const stepNum = formType !== null && formType !== undefined ? parseInt(formType, 10) : NaN;

    if (!file || isNaN(stepNum) || stepNum < 1 || stepNum > 9) {
      return NextResponse.json(
        { error: "File Excel dan formType kategori (1-9) wajib diisi." },
        { status: 400 }
      );
    }

    if (stepNum !== 1 && !targetId && !respondenNik) {
      return NextResponse.json(
        { error: "Pilih responden terlebih dahulu." },
        { status: 400 }
      );
    }

    if (!isExcelFile(file)) {
      return NextResponse.json(
        { error: `File '${file.name}' bukan berkas Excel (.xlsx / .xls) yang valid.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file Excel melebihi batas maksimum 10 MB.` },
        { status: 400 }
      );
    }

    // Pastikan responden ada jika stepNum !== 1
    let responden = null;
    if (targetId || respondenNik) {
      responden = await prisma.responden.findFirst({
        where: {
          OR: [
            ...(targetId ? [{ id: targetId }, { nik: targetId }] : []),
            ...(respondenNik ? [{ nik: respondenNik }] : []),
          ],
          ...(payload.role !== "ADMIN" && { userId: payload.id }),
        },
      });
    }

    if (!responden && stepNum !== 1) {
      return NextResponse.json(
        { error: "Responden tidak ditemukan atau Anda tidak memiliki hak akses." },
        { status: 404 }
      );
    }

    // Convert file to Buffer for parsing
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Validasi Excel menggunakan excelService
    const validationResult = parseAndValidateExcelFile(fileBuffer, stepNum, file.name);
    
    if (validationResult.errors.length > 0) {
      const errorMsg = validationResult.errors.map((e) => e.message).join(" | ");
      return NextResponse.json(
        { error: `Validasi Excel gagal: ${errorMsg}` },
        { status: 400 }
      );
    }

    if (stepNum === 1) {
      if (validationResult.respondenRecords && validationResult.respondenRecords.length > 0) {
        const respData = validationResult.respondenRecords[0];
        if (!respData.nik || respData.nik === "-" || respData.nik.trim().length < 8) {
          return NextResponse.json(
            { error: "NIK pada file Excel Data Responden (Kategori 1) tidak valid atau kosong." },
            { status: 400 }
          );
        }

        const existingNikResponden = await prisma.responden.findUnique({
          where: { nik: respData.nik.trim() },
        });

        const jenisKelaminEnum = respData.jenisKelamin?.toLowerCase().includes("perempuan")
          ? "PEREMPUAN"
          : "LAKI_LAKI";

        const targetRespondenId = existingNikResponden?.id || responden?.id;

        if (targetRespondenId) {
          await prisma.responden.update({
            where: { id: targetRespondenId },
            data: {
              ...(respData.nama && { nama: respData.nama }),
              ...(respData.nik && respData.nik !== "-" && { nik: respData.nik }),
              ...(respData.jenisKelamin && { jenisKelamin: jenisKelaminEnum }),
              ...(respData.kabupatenKota && { kabupatenKota: respData.kabupatenKota }),
              ...(respData.kecamatan && { kecamatan: respData.kecamatan }),
              ...(respData.cabangOlahraga && { cabangOlahraga: respData.cabangOlahraga }),
              ...(respData.nomorTelepon && { nomorTelepon: respData.nomorTelepon }),
            },
          });
        } else {
          await prisma.responden.create({
            data: {
              nik: respData.nik.trim(),
              nama: respData.nama || "Tanpa Nama",
              jenisKelamin: jenisKelaminEnum,
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

      return NextResponse.json({
        success: true,
        message: "Berhasil mengunggah data Responden (Kategori 1).",
      });
    } else {
      if (!validationResult.indicatorRecords || validationResult.indicatorRecords.length === 0) {
        return NextResponse.json(
          { error: `File Excel tidak berisi baris data untuk Kategori ${stepNum}.` },
          { status: 400 }
        );
      }

      const recordsToInsert = (validationResult.indicatorRecords || []).map((rec: ParsedIndicatorRecordData) => ({
        respondenId: responden!.id,
        categoryId: stepNum,
        namaKegiatan: rec.namaKegiatan,
        cabangOlahraga: rec.cabangOlahraga,
        tingkatPenyelenggaraan: rec.tingkatPenyelenggaraan,
        sumberPendanaan: rec.sumberPendanaan,
        medali: rec.medali || null,
        uraianCapaian: rec.uraianCapaian,
      }));

      if (recordsToInsert.length > 0) {
        await prisma.categoryRecord.createMany({
          data: recordsToInsert,
        });
      }

      // Ambil data terbaru yang tersimpan untuk dikembalikan langsung ke client
      const dbRecords = await prisma.categoryRecord.findMany({
        where: { respondenId: responden!.id, categoryId: stepNum },
        orderBy: { createdAt: "asc" },
      });
      const latestRecords = dbRecords.map((rec) => {
        const item: Record<string, any> = {
          "Nama Kegiatan/ Kejuaraan Olahraga": rec.namaKegiatan,
          "Cabang Olahraga": rec.cabangOlahraga,
          "Tingkat Penyelenggaraan": rec.tingkatPenyelenggaraan,
          "Sumber Pendanaan": rec.sumberPendanaan,
        };
        if (stepNum === 2 || stepNum === 7) {
          item["Medali"] = rec.medali || "-";
        }
        item["Uraian Capaian"] = rec.uraianCapaian;
        item["Status"] = rec.status;
        return item;
      });

      return NextResponse.json({
        success: true,
        message: "Berhasil menambahkan data dari file Excel.",
        records: latestRecords,
      });
    }
  } catch (error: any) {
    console.error("Reupload Excel error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal server saat upload ulang Excel." },
      { status: 500 }
    );
  }
}

