import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema untuk update status
const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "TERKIRIM", "TERVERIFIKASI", "PERLU_REVISI"]),
  catatanVerifikator: z.string().optional(),
});

// GET: Get all submissions with user info (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tahun = searchParams.get("tahun");

    const submissions = await prisma.submission.findMany({
      where: {
        ...(status && { status: status as any }),
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
        answers: {
          orderBy: { indicatorId: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get statistics
    const stats = await prisma.submission.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      submissions,
      stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
    });
  } catch (error) {
    console.error("Admin get submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Update submission status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params?: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const id = body.id || (await params)?.id;

    // Validate input
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { status, catatanVerifikator } = validation.data;

    // Check if submission exists
    const existingSubmission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { error: "Submission tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update submission
    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        catatanVerifikator,
        ...(status === "TERVERIFIKASI" && { verifiedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: submission.userId,
        action: `UPDATE_STATUS_${status}`,
        entity: "Submission",
        entityId: id,
        details: { previousStatus: existingSubmission.status, newStatus: status, catatanVerifikator },
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Admin update status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
