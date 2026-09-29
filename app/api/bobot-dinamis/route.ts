import { NextRequest, NextResponse } from "next/server";
import { getDynamicWeights } from "@/lib/services/weightService";

export const dynamic = "force-dynamic";

// GET: Retrieve dynamic weight matrix for all authenticated users / frontend components
export async function GET(request: NextRequest) {
  try {
    const weights = await getDynamicWeights();
    return NextResponse.json({ success: true, weights });
  } catch (error: any) {
    console.error("GET public bobot-dinamis error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data bobot dinamis.", details: error?.message },
      { status: 500 }
    );
  }
}
