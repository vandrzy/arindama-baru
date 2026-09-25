import { NextRequest, NextResponse } from "next/server";
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
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Parameter URL file tidak ditemukan" },
        { status: 400 }
      );
    }

    // Ambil token Vercel Blob jika ada dari environment
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    const headers: Record<string, string> = {};
    if (blobToken) {
      headers["Authorization"] = `Bearer ${blobToken}`;
    }

    // Server-side fetch ke storage URL (melewati batasan CORS/Forbidden browser)
    const fileResponse = await fetch(fileUrl, { headers });

    if (!fileResponse.ok) {
      console.error(`Proxy fetch failed: ${fileResponse.status} ${fileResponse.statusText}`);
      return NextResponse.json(
        { error: `Gagal mengambil file dari storage (Status: ${fileResponse.status})` },
        { status: fileResponse.status }
      );
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    const contentType =
      fileResponse.headers.get("content-type") ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("File download proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error saat mengunduh file", details: error.message },
      { status: 500 }
    );
  }
}
