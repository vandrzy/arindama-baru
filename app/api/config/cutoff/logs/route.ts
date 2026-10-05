import { NextResponse } from "next/server";
import { getCutoffLogs } from "@/lib/services/cutoffService";

export const dynamic = "force-dynamic";

// GET /api/config/cutoff/logs - Ambil riwayat log perubahan batas waktu
export async function GET() {
  try {
    const logs = await getCutoffLogs(50);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("GET /api/config/cutoff/logs error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil riwayat log batas waktu.", details: error?.message },
      { status: 500 }
    );
  }
}
