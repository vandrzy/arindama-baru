import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan atau kadaluarsa" },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get("submissionId");
    const formType = searchParams.get("formType");

    if (!submissionId || !formType) {
      return NextResponse.json(
        { error: "Parameter submissionId dan formType wajib diisi" },
        { status: 400 }
      );
    }

    // Keamanan IDOR: Pastikan submission milik user yang login (kecuali ADMIN)
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        ...(payload.role !== "ADMIN" && { userId: payload.id }),
      },
      select: { id: true },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Kuesioner/submisi tidak ditemukan atau Anda tidak memiliki akses." },
        { status: 404 }
      );
    }

    const evidences = await prisma.validationEvidence.findMany({
      where: {
        submissionId,
        formType,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      evidences,
    });
  } catch (error: any) {
    console.error("Fetch validation evidences error:", error);
    return NextResponse.json(
      { error: "Internal server error saat mengambil data berkas validasi", details: error.message },
      { status: 500 }
    );
  }
}

