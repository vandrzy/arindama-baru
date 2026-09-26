import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyJwtToken } from "@/lib/auth";
import { parseAndValidateExcelFile, ValidationErrorDetail, ParsedIdentityData, ParsedIndicatorRecordData } from "@/lib/services/excelService";
import fs from "fs/promises";
import path from "path";
import os from "os";

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

// POST: Create new submission by streaming files to disk and validating sequentially
export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

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

    // Sort entries so step 0 (Identitas) is processed first
    rawFileEntries.sort((a, b) => a.step - b.step);

    // Create temporary directory on disk to avoid keeping full buffers in RAM
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "arindama-sub-"));

    const aggregatedErrors: ValidationErrorDetail[] = [];
    let parsedIdentity: ParsedIdentityData | null = null;
    const allIndicatorRecords: ParsedIndicatorRecordData[] = [];

    // Process each uploaded file sequentially
    for (const entry of rawFileEntries) {
      const sanitizedName = entry.file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const tempFilePath = path.join(tempDir, `step_${entry.step}_${sanitizedName}`);

      // Save file buffer to disk
      const arrayBuffer = await entry.file.arrayBuffer();
      await fs.writeFile(tempFilePath, Buffer.from(arrayBuffer));

      // Parse and validate from disk file
      const parseResult = parseAndValidateExcelFile(tempFilePath, entry.step, entry.file.name);

      if (parseResult.errors.length > 0) {
        aggregatedErrors.push(...parseResult.errors);
      }

      if (entry.step === 0 && parseResult.identity) {
        parsedIdentity = parseResult.identity;
      }

      if (parseResult.indicatorRecords.length > 0) {
        allIndicatorRecords.push(...parseResult.indicatorRecords);
      }
    }

    // Check if step 0 (Identitas) is missing
    if (!parsedIdentity) {
      const hasStep0 = rawFileEntries.some((e) => e.step === 0);
      if (!hasStep0) {
        aggregatedErrors.unshift({
          file: "Form Identitas Responden",
          step: 0,
          message: "Form Identitas Responden (file 0) wajib diunggah.",
        });
      }
    }

    // If there are any validation errors across any files, reject request with detailed error mapping
    if (aggregatedErrors.length > 0) {
      return NextResponse.json(
        {
          error: "Validasi file Excel gagal",
          errors: aggregatedErrors,
        },
        { status: 400 }
      );
    }

    // Transactional save to DB
    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          noRegistrasi: crypto.randomUUID(),
          userId: payload.id,
          tahunSurvei: data.tahunSurvei,
          totalIndikatorTerisi: new Set(allIndicatorRecords.map((r) => r.indicatorId)).size,
          respondenIdentity: {
            create: parsedIdentity!,
          },
          indicatorRecords: {
            create: allIndicatorRecords,
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
  } finally {
    // Cleanup temporary files from disk
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

