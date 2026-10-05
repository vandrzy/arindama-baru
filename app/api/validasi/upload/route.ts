import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { compressPdfWithGhostscript } from "@/lib/services/pdfCompressor";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15 MB batas maksimal file mentah yang boleh di-upload

const uploadParamsSchema = z.object({
  respondenId: z.string().optional(),
  submissionId: z.string().optional(), // Tambahan toleransi parameter legacy
  formType: z.string().min(1, "formType diperlukan"),
  recordId: z.string().min(1, "recordId diperlukan"),
  namaForm: z.string().optional(),
});

function sanitizePart(part: string): string {
  return part
    .replace(/[:\/\\?%*:|"<>]/g, "") // Hapus karakter ilegal untuk nama file/direktori
    .replace(/\s+/g, " ")            // Pertahankan spasi tunggal
    .trim();
}

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
        { error: "Sesi tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const respondenIdRaw = (formData.get("respondenId") as string | null) || (formData.get("submissionId") as string | null);
    const formTypeRaw = formData.get("formType") as string | null;
    const recordIdRaw = formData.get("recordId") as string | null;
    const namaFormRaw = (formData.get("namaForm") as string | null) || undefined;

    if (!file) {
      return NextResponse.json(
        { error: "File bukti validasi (PDF) wajib diikutsertakan." },
        { status: 400 }
      );
    }

    // Validasi parameter request dengan Zod
    const paramsValidation = uploadParamsSchema.safeParse({
      respondenId: respondenIdRaw,
      formType: formTypeRaw,
      recordId: recordIdRaw,
      namaForm: namaFormRaw,
    });

    if (!paramsValidation.success || (!respondenIdRaw)) {
      return NextResponse.json(
        { error: "Parameter request tidak valid (respondenId wajib diisi)", details: paramsValidation.error?.errors },
        { status: 400 }
      );
    }

    const { respondenId: rawId, formType, recordId } = paramsValidation.data;
    const targetRespondenId = rawId || respondenIdRaw!;

    // Validasi ekstensi file harus PDF
    const fileNameLower = file.name.toLowerCase();
    const isPdfExt = fileNameLower.endsWith(".pdf");
    const isPdfType = !file.type || file.type === "application/pdf";

    if (!isPdfExt && !isPdfType) {
      return NextResponse.json(
        { error: `File '${file.name}' bukan file PDF yang valid. Hanya file berekstensi .pdf yang diperbolehkan.` },
        { status: 400 }
      );
    }

    // Validasi maksimal ukuran file mentah yang diunggah (15 MB)
    if (file.size > MAX_UPLOAD_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (MAX_UPLOAD_SIZE / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `Ukuran file '${file.name}' (${fileSizeMB} MB) melebihi batas maksimum awal ${maxMB} MB.` },
        { status: 400 }
      );
    }

    // Cari responden dan bukti validasi eksis
    const responden = await prisma.responden.findFirst({
      where: {
        OR: [{ id: targetRespondenId }, { nik: targetRespondenId }],
        ...(payload.role !== "ADMIN" && { userId: payload.id }),
      },
      include: {
        validationEvidences: {
          where: {
            formType,
            recordId,
          },
        },
      },
    });

    if (!responden) {
      return NextResponse.json(
        { error: "Responden tidak ditemukan atau Anda tidak memiliki akses." },
        { status: 404 }
      );
    }

    const existingEvidence = responden.validationEvidences[0] || null;
    const trimmedNamaResponden = sanitizePart(responden.nama.trim());
    const fileExt = file.name.includes(".") ? `.${file.name.split(".").pop()}` : ".pdf";

    // Format direktori: "id responden_nama responden"
    const folderName = `${responden.id}_${trimmedNamaResponden}`;
    // Format nama file:
    // Untuk Kategori 1 / Data Responden: "id responden_nama responden.pdf"
    // Untuk Kategori 2-9 / Entri Indikator: "id record_nama responden.pdf"
    const isRespondenForm = formType === "RESPONDEN" || formType === "1" || recordId === responden.id;
    const formattedFileName = isRespondenForm
      ? `${responden.id}_${trimmedNamaResponden}${fileExt}`
      : `${recordId}_${trimmedNamaResponden}${fileExt}`;

    const uploadDir = path.join(process.cwd(), "uploads", folderName);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, formattedFileName);
    const timestamp = Date.now();
    const tempRawPath = path.join(uploadDir, `raw_${timestamp}_${formattedFileName}`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Tulis file mentah sementara
    await fs.writeFile(tempRawPath, fileBuffer);

    // Proses Kompresi Ghostscript PDF (Target maksimal 1 MB)
    const compressResult = await compressPdfWithGhostscript(
      tempRawPath,
      filePath,
      1 * 1024 * 1024
    );

    // Hapus file mentah sementara setelah selesai kompresi
    await fs.unlink(tempRawPath).catch(() => {});

    if (!compressResult.success) {
      await fs.unlink(filePath).catch(() => {});
      return NextResponse.json(
        { error: compressResult.error || "Kompresi file PDF gagal." },
        { status: 400 }
      );
    }

    // Hapus file LAMA jika ada
    if (existingEvidence) {
      let oldFilePath: string | null = null;
      if (existingEvidence.fileName) {
        oldFilePath = path.join(uploadDir, existingEvidence.fileName);
      } else if (existingEvidence.fileUrl && existingEvidence.fileUrl.startsWith("/uploads/")) {
        const sanitizedPath = existingEvidence.fileUrl.startsWith("/")
          ? existingEvidence.fileUrl.substring(1)
          : existingEvidence.fileUrl;
        oldFilePath = path.join(process.cwd(), sanitizedPath);
      }

      if (oldFilePath && oldFilePath !== filePath) {
        await fs.unlink(oldFilePath).catch((err) => {
          console.warn("[ValidationUpload] File lama tidak dapat dihapus:", err?.message || err);
        });
      }
    }

    const localFileUrl = `/uploads/${folderName}/${formattedFileName}`;
    const finalBytes = compressResult.finalSize || file.size;
    const sizeInMB = (finalBytes / (1024 * 1024)).toFixed(2) + " MB";

    // Upsert database record
    const evidence = await prisma.validationEvidence.upsert({
      where: {
        respondenId_formType_recordId: {
          respondenId: responden.id,
          formType,
          recordId,
        },
      },
      update: {
        fileName: formattedFileName,
        fileUrl: localFileUrl,
        fileSize: sizeInMB,
      },
      create: {
        respondenId: responden.id,
        formType,
        recordId,
        fileName: formattedFileName,
        fileUrl: localFileUrl,
        fileSize: sizeInMB,
      },
    });

    // Catat AuditLog
    await prisma.auditLog.create({
      data: {
        userId: payload.id,
        action: "Verifikasi Berkas",
        entity: "ValidationEvidence",
        entityId: evidence.id,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        details: { recordId, formType, fileName: formattedFileName },
      },
    });

    return NextResponse.json({
      success: true,
      evidence,
      message: `Berkas '${formattedFileName}' berhasil diunggah untuk record #${recordId}`,
    });
  } catch (error: any) {
    console.error("Upload validation evidence error:", error);
    return NextResponse.json(
      { error: "Internal server error saat mengunggah berkas validasi", details: error.message },
      { status: 500 }
    );
  }
}


