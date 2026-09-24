import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { SubmissionStatus } from "@prisma/client";
import { verifyJwtToken } from "@/lib/auth";

// Allowed Excel extensions & MIME types
const ALLOWED_EXCEL_EXTENSIONS = [".xlsx", ".xls"];
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/wps-office.xlsx",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit per file (Cegah DoS)

// Poin 3: Helper sanitasi nama file agar URL-friendly
function sanitizeFileName(fileName: string): string {
  const parts = fileName.split(".");
  const ext = parts.length > 1 ? `.${parts.pop()}` : "";
  const baseName = parts.join(".");
  const sanitizedBase = baseName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return `${sanitizedBase || "file"}${ext.toLowerCase()}`;
}

// Poin 5: Validasi format file Excel dengan komentar penjelas !file.type
function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXCEL_EXTENSIONS.some((ext) => name.endsWith(ext));
  // Logika `!file.type` diperbolehkan karena beberapa browser/environment testing tidak mengirimkan MIME type pada FormData
  const hasValidType = !file.type || ALLOWED_EXCEL_TYPES.includes(file.type);
  return hasValidExt && hasValidType;
}

// Validation schema untuk metadata submission
const submissionSchema = z.object({
  tahunSurvei: z.number().int().min(2020).max(2100).default(2024),
});

// GET: List all submissions (with optional filters)
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
    const status = searchParams.get("status");
    const tahun = searchParams.get("tahun");

    // Scoping akses: RESPONDEN hanya bisa melihat data milik sendiri
    const targetUserId = payload.role === "RESPONDEN" ? payload.id : filterUserId || undefined;

    const submissions = await prisma.submission.findMany({
      where: {
        ...(targetUserId && { userId: targetUserId }),
        ...(status && { status: status as SubmissionStatus }),
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

// POST: Create new submission with Excel file uploads
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

    // Validate metadata input using Zod
    const validation = submissionSchema.safeParse({ tahunSurvei });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi metadata gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Extract uploaded files from FormData
    const filesToUpload: { file: File; indicatorId: number; indicatorTitle?: string }[] = [];

    for (const [key, value] of formData.entries()) {
      if (typeof value === "object" && value !== null && "name" in value && "size" in value) {
        const file = value as File;
        
        // Pencocokan key FormData secara ketat
        const keyMatch = key.match(/^(?:file|indicator|fileIndicator)[_-]?(\d+)$/i);
        if (keyMatch) {
          if (file.size > 0) {
            // Batasan ukuran file (Max 10MB) untuk pencegahan DoS
            if (file.size > MAX_FILE_SIZE) {
              return NextResponse.json(
                { error: `File '${file.name}' melebihi batas ukuran maksimum (10 MB)` },
                { status: 400 }
              );
            }

            // Validate Excel file format
            if (!isExcelFile(file)) {
              return NextResponse.json(
                { error: `File '${file.name}' bukan file Excel yang valid (.xlsx / .xls)` },
                { status: 400 }
              );
            }

            const indicatorId = parseInt(keyMatch[1]);
            const indicatorTitle =
              (formData.get(`indicatorTitle_${indicatorId}`) as string) || `Indikator ${indicatorId}`;

            filesToUpload.push({
              file,
              indicatorId,
              indicatorTitle,
            });
          }
        }
      }
    }

    if (filesToUpload.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada file Excel yang diunggah" },
        { status: 400 }
      );
    }

    // Upload file ke Vercel Blob secara paralel dengan folder payload.id
    const userFolder = payload.id;

    const uploadPromises = filesToUpload.map(async (item) => {
      const safeFileName = sanitizeFileName(item.file.name);
      let blob;
      try {
        blob = await put(`submissions/${userFolder}/${Date.now()}-${safeFileName}`, item.file, {
          access: "public",
        });
      } catch (blobErr: any) {
        // Jika Vercel Blob Store dikonfigurasi sebagai private store, gunakan access: "private"
        if (blobErr?.message?.includes("private store") || blobErr?.message?.includes("private access")) {
          blob = await put(`submissions/${userFolder}/${Date.now()}-${safeFileName}`, item.file, {
            access: "private",
          });
        } else {
          throw blobErr;
        }
      }

      return {
        indicatorId: item.indicatorId,
        indicatorTitle: item.indicatorTitle || `Indikator ${item.indicatorId}`,
        fileBuktiName: item.file.name,
        fileBuktiSize: item.file.size,
        fileBuktiHash: blob.url,
      };
    });

    const uploadedAnswers = await Promise.all(uploadPromises);

    // Transaksi Prisma dengan Rollback Blob jika DB gagal
    try {
      const submission = await prisma.submission.create({
        data: {
          userId: payload.id,
          tahunSurvei: data.tahunSurvei,
          status: "TERKIRIM",
          totalIndikatorTerisi: uploadedAnswers.length,
          answers: {
            create: uploadedAnswers as any,
          },
        },
        include: {
          answers: true,
        },
      });

      // Log audit for creation
      await prisma.auditLog.create({
        data: {
          userId: payload.id,
          action: "CREATE_SUBMISSION",
          entity: "Submission",
          entityId: submission.id,
        },
      });

      return NextResponse.json(
        { success: true, submissionId: submission.id, submission },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Prisma submission create error, rolling back blob uploads:", dbError);
      // Rollback: Hapus file Vercel Blob yang baru saja di-upload
      const urlsToDelete = uploadedAnswers.map((ans) => ans.fileBuktiHash);
      if (urlsToDelete.length > 0) {
        await del(urlsToDelete).catch((delErr) => {
          console.error("Gagal melakukan rollback pembersihan Vercel Blob:", delErr);
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

