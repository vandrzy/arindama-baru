import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { parseAndValidateExcelFile, ParsedIndicatorRecordData } from "@/lib/services/excelService";
import fs from "fs/promises";
import path from "path";

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
    const submissionId = formData.get("submissionId") as string | null;
    const formType = formData.get("formType") as string | null;

    if (!file || !submissionId || formType === null || formType === undefined) {
      return NextResponse.json(
        { error: "File Excel, submissionId, dan formType wajib diisi." },
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

    // Pastikan submisi ada dan user berhak mengakses
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        ...(payload.role !== "ADMIN" && { userId: payload.id }),
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submisi kuesioner tidak ditemukan atau Anda tidak memiliki hak akses." },
        { status: 404 }
      );
    }

    const stepNum = parseInt(formType);
    const isIdentity = stepNum === 0 || formType === "IdentitasResponden";

    // Convert file to Buffer for parsing
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Validasi Excel menggunakan excelService (pass fileBuffer, stepNum, file.name)
    const validationResult = parseAndValidateExcelFile(fileBuffer, isNaN(stepNum) ? 0 : stepNum, file.name);
    
    if (validationResult.errors.length > 0) {
      const errorMsg = validationResult.errors.map((e) => e.message).join(" | ");
      return NextResponse.json(
        { error: `Validasi Excel gagal: ${errorMsg}` },
        { status: 400 }
      );
    }

    if (isIdentity && (!validationResult.identities || validationResult.identities.length === 0)) {
      return NextResponse.json(
        { error: "File Excel tidak berisi data Identitas Responden yang valid." },
        { status: 400 }
      );
    }

    if (!isIdentity) {
      if (!validationResult.indicatorRecords || validationResult.indicatorRecords.length === 0) {
        return NextResponse.json(
          { error: `File Excel tidak berisi baris data untuk Indikator ${stepNum}.` },
          { status: 400 }
        );
      }
    }

    // Ambil bukti validasi (evidence) lama untuk dihapus filenya setelah DB transaction berhasil
    const oldEvidences = await prisma.validationEvidence.findMany({
      where: {
        submissionId,
        formType,
      },
    });

    // Run DATABASE TRANSACTION
    await prisma.$transaction(async (tx) => {
      // 1. Hapus metadata bukti validasi lama di database
      await tx.validationEvidence.deleteMany({
        where: {
          submissionId,
          formType,
        },
      });

      // 2. Hapus data record lama & Simpan data record baru
      if (isIdentity) {
        await tx.respondenIdentity.deleteMany({
          where: { submissionId },
        });

        if (validationResult.identities && validationResult.identities.length > 0) {
          await tx.respondenIdentity.createMany({
            data: validationResult.identities.map(id => ({
              submissionId,
              namaLengkap: id.namaLengkap,
              jenisKelamin: id.jenisKelamin,
              tanggalLahir: id.tanggalLahir,
              umur: id.umur,
              kabupatenKotaAsal: id.kabupatenKotaAsal,
              kecamatan: id.kecamatan,
              pekerjaanJabatan: id.pekerjaanJabatan,
              nomorTelepon: id.nomorTelepon,
            })),
          });
        }
      } else {
        await tx.indicatorRecord.deleteMany({
          where: {
            submissionId,
            indicatorId: stepNum,
          },
        });

        const recordsToInsert = (validationResult.indicatorRecords || []).map((rec: ParsedIndicatorRecordData) => ({
          submissionId,
          indicatorId: stepNum,
          namaKegiatan: rec.namaKegiatan,
          cabangOlahraga: rec.cabangOlahraga,
          tingkatPenyelenggaraan: rec.tingkatPenyelenggaraan,
          sumberPendanaan: rec.sumberPendanaan,
          medali: rec.medali || null,
          uraianCapaian: rec.uraianCapaian,
        }));

        if (recordsToInsert.length > 0) {
          await tx.indicatorRecord.createMany({
            data: recordsToInsert,
          });
        }
      }

      // 3. Update total indikator terisi pada submission
      const filledIdentity = await tx.respondenIdentity.findFirst({ where: { submissionId } });
      const filledIndicators = await tx.indicatorRecord.groupBy({
        by: ["indicatorId"],
        where: { submissionId },
      });

      const newTotalTerisi = (filledIdentity ? 1 : 0) + filledIndicators.length;

      await tx.submission.update({
        where: { id: submissionId },
        data: {
          totalIndikatorTerisi: newTotalTerisi,
        },
      });
    });

    // 4. HAPUS FILE EVIDEN FISIK DARI STORAGE SETELAH DB TRANSACTION SUKSES
    for (const ev of oldEvidences) {
      let physicalPath: string | null = null;
      if (ev.fileName) {
        physicalPath = path.join(process.cwd(), "uploads", submissionId, ev.fileName);
      } else if (ev.fileUrl && ev.fileUrl.startsWith("/uploads/")) {
        const sanitized = ev.fileUrl.startsWith("/") ? ev.fileUrl.substring(1) : ev.fileUrl;
        physicalPath = path.join(process.cwd(), sanitized);
      }

      if (physicalPath) {
        await fs.unlink(physicalPath).catch((err) => {
          console.warn("[Reupload] Gagal menghapus file fisiknya:", err?.message || err);
        });
      }
    }

    // Ambil data terbaru yang tersimpan untuk dikembalikan langsung ke client
    let latestRecords: Record<string, any>[] = [];
    if (isIdentity) {
      const identities = await prisma.respondenIdentity.findMany({ where: { submissionId }, orderBy: { createdAt: "asc" } });
      latestRecords = identities.map(identity => ({
        "Nama Lengkap & Gelar": identity.namaLengkap,
        "Jenis Kelamin": identity.jenisKelamin,
        "Tanggal Lahir": identity.tanggalLahir,
        "Umur": identity.umur,
        "Kabupaten/ Kota Asal": identity.kabupatenKotaAsal,
        "Kecamatan": identity.kecamatan,
        "Pekerjaan/ Jabatan di Bidang Olahraga": identity.pekerjaanJabatan,
        "Nomor Telepon/ Whatsapp Aktif": identity.nomorTelepon,
      }));
    } else {
      const dbRecords = await prisma.indicatorRecord.findMany({
        where: { submissionId, indicatorId: stepNum },
        orderBy: { createdAt: "asc" },
      });
      latestRecords = dbRecords.map((rec) => {
        const item: Record<string, any> = {
          "Nama Kegiatan/ Kejuaraan Olahraga": rec.namaKegiatan,
          "Cabang Olahraga": rec.cabangOlahraga,
          "Tingkat Penyelenggaraan": rec.tingkatPenyelenggaraan,
          "Sumber Pendanaan": rec.sumberPendanaan,
        };
        if (stepNum === 1 || stepNum === 6) {
          item["Medali"] = rec.medali || "-";
        }
        item["Uraian Capaian"] = rec.uraianCapaian;
        return item;
      });
    }

    return NextResponse.json({
      success: true,
      message: "Berhasil mengunggah ulang file Excel. Data lama dan bukti fisik terkait telah diperbarui.",
      records: latestRecords,
    });
  } catch (error: any) {
    console.error("Reupload Excel error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal server saat upload ulang Excel." },
      { status: 500 }
    );
  }
}
