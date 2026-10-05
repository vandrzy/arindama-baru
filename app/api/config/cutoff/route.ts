import { NextRequest, NextResponse } from "next/server";
import { getCutoffConfig, updateCutoffConfig } from "@/lib/services/cutoffService";
import { verifyJwtToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/config/cutoff - Ambil status & konfigurasi batas waktu
export async function GET() {
  try {
    const config = await getCutoffConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error("GET /api/config/cutoff error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil konfigurasi batas waktu.", details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/config/cutoff - Simpan pengaturan & catat log
export async function POST(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get("auth_token")?.value;
    let adminId = "ADMIN_SYSTEM";
    let adminNama = "Admin Dispora";

    if (tokenCookie) {
      const payload = verifyJwtToken(tokenCookie);
      if (payload) {
        adminId = payload.id;
        adminNama = payload.email; // atau nama jika tersedia di token
      }
    }

    const body = await request.json();
    const updatedConfig = await updateCutoffConfig(body, adminId, adminNama);

    return NextResponse.json({
      success: true,
      message: "Konfigurasi batas waktu berhasil diperbarui.",
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error("POST /api/config/cutoff error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui konfigurasi batas waktu.", details: error?.message },
      { status: 500 }
    );
  }
}
