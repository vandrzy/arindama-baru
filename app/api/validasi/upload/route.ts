import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

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
    const submissionId = formData.get("submissionId") as string | null;
    const formType = formData.get("formType") as string | null;
    const recordId = formData.get("recordId") as string | null;
    const rawNamaForm = (formData.get("namaForm") as string | null) || `Indikator ${formType}`;

    if (!file || !submissionId || !formType || !recordId) {
      return NextResponse.json(
        { error: "Parameter tidak lengkap (file, submissionId, formType, recordId diperlukan)." },
        { status: 400 }
      );
    }

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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file '${file.name}' melebihi batas maksimum 10 MB.` },
        { status: 400 }
      );
    }

    // Cek apakah submission ada
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Kuesioner/submisi tidak ditemukan." },
        { status: 404 }
      );
    }

    // Penamaan file terstruktur: {noRegistrasi}_{namaForm}_{identifierBaris}_{timestamp}.ekstensi
    const noRegistrasi = submission.noRegistrasi || submission.id;
    const timestamp = Date.now();
    const fileExt = file.name.includes(".") ? `.${file.name.split(".").pop()}` : ".pdf";

    const formattedFileName = generateValidationFileName({
      noRegistrasi,
      namaForm: rawNamaForm,
      identifierBaris: recordId,
      timestamp,
      ext: fileExt,
    });

    const blobPath = `validation/${submissionId}/${formattedFileName}`;

    let blob;
    try {
      blob = await put(blobPath, file, { access: "public" });
    } catch (blobErr: any) {
      if (blobErr?.message?.includes("private store") || blobErr?.message?.includes("private access")) {
        blob = await put(blobPath, file, { access: "private" });
      } else {
        throw blobErr;
      }
    }

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
        fileUrl: blob.url,
        fileSize: sizeInMB,
      },
      create: {
        submissionId,
        formType,
        recordId,
        fileName: formattedFileName,
        fileUrl: blob.url,
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
