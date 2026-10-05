import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import {
  getDynamicWeights,
  updateDynamicWeights,
  resetDynamicWeights,
  WeightRow,
} from "@/lib/services/weightService";
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
    return { error: "Akses ditolak. Hanya Administrator yang dapat mengakses halaman ini.", status: 403 };
  }

  return { payload };
}

// GET: Retrieve current dynamic weight matrix
export async function GET(request: NextRequest) {
  try {
    const auth = checkAdminAccess(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const weights = await getDynamicWeights();
    return NextResponse.json({ success: true, weights });
  } catch (error: any) {
    console.error("GET bobot-dinamis error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data bobot dinamis.", details: error?.message },
      { status: 500 }
    );
  }
}

// PUT: Update dynamic weight matrix
export async function PUT(request: NextRequest) {
  try {
    const auth = checkAdminAccess(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    if (!body || !Array.isArray(body.weights) || body.weights.length === 0) {
      return NextResponse.json(
        { error: "Payload data weights tidak valid." },
        { status: 400 }
      );
    }

    const updatedWeights = await updateDynamicWeights(body.weights as WeightRow[]);

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        userId: auth.payload.id,
        action: "Ubah Bobot",
        entity: "DynamicWeight",
        details: body.weights,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Konfigurasi bobot berhasil diperbarui.",
      weights: updatedWeights,
    });
  } catch (error: any) {
    console.error("PUT bobot-dinamis error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui konfigurasi bobot.", details: error?.message },
      { status: 500 }
    );
  }
}

// POST: Reset dynamic weight matrix to Kemenpora standard
export async function POST(request: NextRequest) {
  try {
    const auth = checkAdminAccess(request);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const resetWeights = await resetDynamicWeights();

    await prisma.auditLog.create({
      data: {
        userId: auth.payload.id,
        action: "Reset Bobot",
        entity: "DynamicWeight",
        details: { resetTo: "Kemenpora Standard" },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Konfigurasi bobot berhasil dikembalikan ke Standar Kemenpora.",
      weights: resetWeights,
    });
  } catch (error: any) {
    console.error("POST reset bobot-dinamis error:", error);
    return NextResponse.json(
      { error: "Gagal mengembalikan standar bobot.", details: error?.message },
      { status: 500 }
    );
  }
}
