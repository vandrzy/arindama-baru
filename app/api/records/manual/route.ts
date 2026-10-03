import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    const body = await request.json();
    const targetCatId = body.categoryId || body.indicatorId;
    const {
      respondenId,
      respondenNik,
      namaKegiatan,
      cabangOlahraga,
      tingkatPenyelenggaraan,
      medali,
      sumberPendanaan,
      uraianCapaian
    } = body;

    const catIdNum = parseInt(targetCatId, 10);

    if (!targetCatId || (catIdNum !== 1 && !respondenId && !respondenNik) || !namaKegiatan || !cabangOlahraga || !tingkatPenyelenggaraan) {
      return NextResponse.json({ error: "Kolom wajib belum diisi." }, { status: 400 });
    }

    // Cari responden
    let responden = null;
    if (respondenId) {
      responden = await prisma.responden.findUnique({ where: { id: respondenId } });
    }
    if (!responden && respondenNik) {
      responden = await prisma.responden.findUnique({ where: { nik: respondenNik } });
    }

    if (!responden) {
      return NextResponse.json({ error: "Responden tidak ditemukan." }, { status: 404 });
    }

    if (body.id) {
      // Update data jika id dikirimkan
      const updatedRecord = await prisma.categoryRecord.update({
        where: { id: body.id },
        data: {
          categoryId: catIdNum,
          respondenId: responden.id,
          namaKegiatan,
          cabangOlahraga,
          tingkatPenyelenggaraan,
          medali: medali || "",
          sumberPendanaan: sumberPendanaan || "APBD (Daerah)",
          uraianCapaian: uraianCapaian || "",
        }
      });
      return NextResponse.json({ success: true, data: updatedRecord });
    } else {
      // Buat CategoryRecord baru
      const newRecord = await prisma.categoryRecord.create({
        data: {
          categoryId: catIdNum,
          respondenId: responden.id,
          namaKegiatan,
          cabangOlahraga,
          tingkatPenyelenggaraan,
          medali: medali || "",
          sumberPendanaan: sumberPendanaan || "APBD (Daerah)",
          uraianCapaian: uraianCapaian || "",
          status: RecordStatus.MENUNGGU_REVIEW
        }
      });
      return NextResponse.json({ success: true, data: newRecord });
    }
  } catch (error: any) {
    console.error("POST /api/records/manual error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan entri kegiatan.", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyJwtToken(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    try {
      await prisma.categoryRecord.delete({ where: { id } });
    } catch {
      await prisma.responden.delete({ where: { id } });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/records/manual error:", error);
    return NextResponse.json({ error: "Gagal menghapus entri." }, { status: 500 });
  }
}

