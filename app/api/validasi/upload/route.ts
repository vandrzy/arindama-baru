import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB limit per file

const uploadParamsSchema = z.object({
  submissionId: z.string().min(1, "submissionId diperlukan"),
  formType: z.string().min(1, "formType diperlukan"),
  recordId: z.string().min(1, "recordId diperlukan"),
  namaForm: z.string().optional(),
});

function sanitizePart(part: string): string {
  return part
    .replace(/[:\/\\?%*:|"<>]/g, "") // Hapus karakter ilegal untuk nama file
    .replace(/\s+/g, "-")            // Ubah spasi menjadi hyphen
    .replace(/[^a-zA-Z0-9_-]/g, ""); // Pertahankan alphanumeric, hyphen, dan underscore
}

function generateValidationFileName({
  noRegistrasi,
  namaForm,
  identifierBaris,
  timestamp,
  ext = ".pdf",
}: {
  noRegistrasi: string;
  namaForm: string;
  identifierBaris: string;
  timestamp: number | string;
  ext?: string;
}): string {
  const cleanNoReg = sanitizePart(noRegistrasi) || "NoReg";
  const cleanForm = sanitizePart(namaForm) || "Form";
  const cleanBaris = sanitizePart(identifierBaris) || "Baris";
  const cleanExt = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;

  return `${cleanNoReg}_${cleanForm}_${cleanBaris}_${timestamp}${cleanExt}`;
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
    const submissionIdRaw = formData.get("submissionId") as string | null;
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
      submissionId: submissionIdRaw,
      formType: formTypeRaw,
      recordId: recordIdRaw,
      namaForm: namaFormRaw,
    });

    if (!paramsValidation.success) {
      return NextResponse.json(
        { error: "Parameter request tidak valid", details: paramsValidation.error.errors },
        { status: 400 }
      );
    }

    const { submissionId, formType, recordId, namaForm } = paramsValidation.data;
    const effectiveNamaForm = namaForm || `Indikator ${formType}`;

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

    // Validasi maksimal ukuran file (2 MB)
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `Ukuran file '${file.name}' (${fileSizeMB} MB) melebihi batas maksimum ${maxMB} MB.` },
        { status: 400 }
      );
    }

    // Keamanan IDOR + Optimasi DB (Gabungkan cek submission & existing evidence dalam 1 query)
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
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

    if (!submission) {
      return NextResponse.json(
        { error: "Kuesioner/submisi tidak ditemukan atau Anda tidak memiliki akses ke submisi ini." },
        { status: 404 }
      );
    }

    const existingEvidence = submission.validationEvidences[0] || null;

    // Penamaan file terstruktur
    const noRegistrasi = submission.noRegistrasi || submission.id;
    const timestamp = Date.now();
    const fileExt = file.name.includes(".") ? `.${file.name.split(".").pop()}` : ".pdf";

    const formattedFileName = generateValidationFileName({
      noRegistrasi,
      namaForm: effectiveNamaForm,
      identifierBaris: recordId,
      timestamp,
      ext: fileExt,
    });

    // Simpan file BARU ke local storage (asinkron): uploads/<submissionId>/<formattedFileName>
    const uploadDir = path.join(process.cwd(), "uploads", submissionId);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, formattedFileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, fileBuffer);

    // Hapus file LAMA secara asinkron jika ada
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

    const localFileUrl = `/uploads/${submissionId}/${formattedFileName}`;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    // Upsert database record
    const evidence = await prisma.validationEvidence.upsert({
      where: {
        submissionId_formType_recordId: {
          submissionId,
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
        submissionId,
        formType,
        recordId,
        fileName: formattedFileName,
        fileUrl: localFileUrl,
        fileSize: sizeInMB,
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

