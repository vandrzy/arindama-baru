import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { SubmissionStatus } from "@prisma/client";

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
  userId: z.string().optional().nullable(),
  tahunSurvei: z.number().int().min(2020).max(2100).default(2024),
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
    const formData = await request.formData();

    const rawUserId = formData.get("userId");
    let validatedUserId: string | null = null;
    
    // Poin 6: Keamanan - Pengecekan keberadaan userId di DB untuk mencegah IDOR / Spoofing
    if (typeof rawUserId === "string" && rawUserId.trim() !== "") {
      const user = await prisma.user.findUnique({
        where: { id: rawUserId.trim() },
        select: { id: true },
      });
      if (user) {
        validatedUserId = user.id;
      }
    }

    const tahunRaw = formData.get("tahunSurvei");
    const tahunSurvei = tahunRaw ? parseInt(tahunRaw as string) : new Date().getFullYear();

    // Validate metadata input using Zod
    const validation = submissionSchema.safeParse({ userId: validatedUserId, tahunSurvei });
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
        
        // Poin 4: Pencocokan key FormData secara ketat (misal: "file_1", "indicator_2", "fileIndicator3")
        const keyMatch = key.match(/^(?:file|indicator|fileIndicator)[_-]?(\d+)$/i);
        if (keyMatch) {
          if (file.size > 0) {
            // Poin 7: Batasan ukuran file (Max 10MB) untuk pencegahan DoS
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

    // Poin 1 & 3: Upload file ke Vercel Blob secara paralel (Promise.all) dengan nama ter-sanitasi
    const userFolder = data.userId || "guest";

    const uploadPromises = filesToUpload.map(async (item) => {
      const safeFileName = sanitizeFileName(item.file.name);
      const blob = await put(`submissions/${userFolder}/${Date.now()}-${safeFileName}`, item.file, {
        access: "public",
      });

      return {
        indicatorId: item.indicatorId,
        indicatorTitle: item.indicatorTitle || `Indikator ${item.indicatorId}`,
        fileBuktiName: item.file.name,
        fileBuktiSize: item.file.size,
        fileBuktiHash: blob.url,
      };
    });

    const uploadedAnswers = await Promise.all(uploadPromises);

    // Poin 2: Transaksi Prisma dengan Rollback Blob jika DB gagal
    try {
      const submission = await prisma.submission.create({
        data: {
          userId: data.userId || undefined,
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

      // Log audit for creation (supports optional userId for guests)
      await prisma.auditLog.create({
        data: {
          userId: data.userId || undefined,
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

