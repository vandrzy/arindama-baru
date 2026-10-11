import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUS_MAPPING: Record<string, RecordStatus> = {
  "Menunggu Review": RecordStatus.MENUNGGU_REVIEW,
  "Revisi": RecordStatus.REVISI,
  "Sah & Terverifikasi": RecordStatus.SAH_TERVERIFIKASI,
  "Sah": RecordStatus.SAH,
  "Disetujui": RecordStatus.DISETUJUI,
  "MENUNGGU_REVIEW": RecordStatus.MENUNGGU_REVIEW,
  "REVISI": RecordStatus.REVISI,
  "SAH_TERVERIFIKASI": RecordStatus.SAH_TERVERIFIKASI,
  "SAH": RecordStatus.SAH,
  "DISETUJUI": RecordStatus.DISETUJUI,
};

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

    const mappedStatus = status ? STATUS_MAPPING[status] : undefined;
    if (!mappedStatus) {
      return NextResponse.json(
        { error: "Status verifikasi tidak valid. Pilih antara 'Revisi' atau 'Sah & Terverifikasi'." },
        { status: 400 }
      );
    }

    // Update category record or responden status in database
    let updatedRecord: any = null;
    try {
      updatedRecord = await prisma.categoryRecord.update({
        where: { id: recordId },
        data: { status: mappedStatus },
      });
    } catch {
      updatedRecord = await prisma.responden.update({
        where: { id: recordId },
        data: { status: mappedStatus },
      });
    }

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
