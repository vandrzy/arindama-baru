import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Get all submissions with user info & records (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get("tahun");

    const submissions = await prisma.submission.findMany({
      where: {
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
        indicatorRecords: {
          orderBy: { indicatorId: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalSubmissions = await prisma.submission.count();

    return NextResponse.json({
      success: true,
      submissions,
      totalSubmissions,
    });
  } catch (error) {
    console.error("Admin get submissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
