import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Helper for verifying ADMIN role
function checkAdminAccess(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return { error: "Sesi tidak ditemukan. Silakan login kembali.", status: 401 };
  }

  const payload = verifyJwtToken(token);
  if (!payload) {
    return { error: "Sesi tidak valid.", status: 401 };
  }

  if (payload.role !== "ADMIN") {
    return { error: "Akses ditolak. Hanya Administrator yang dapat merubah status verifikasi.", status: 403 };
  }

  return { payload };
}

// PUT: Update verification status of an IndicatorRecord
export async function PUT(
  request: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const auth = checkAdminAccess(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { recordId } = params;
    if (!recordId) {
      return NextResponse.json(
        { error: "ID Record tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["Menunggu Review", "Revisi", "Sah & Terverifikasi", "Sah", "Disetujui"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status verifikasi tidak valid. Pilih antara 'Revisi' atau 'Sah & Terverifikasi'." },
        { status: 400 }
      );
    }

    // Update indicator record status in database
    const updatedRecord = await prisma.indicatorRecord.update({
      where: { id: recordId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Status verifikasi berhasil diperbarui menjadi '${status}'`,
      record: updatedRecord,
    });
  } catch (error: any) {
    console.error("PUT admin verifikasi error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status verifikasi.", details: error?.message },
      { status: 500 }
    );
  }
}
