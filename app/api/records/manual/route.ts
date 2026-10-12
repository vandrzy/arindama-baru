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
    const targetCatId = body.categoryId || body.indicatorId || body.formType || body.form_type || 1;
    const {
      respondenId: rawRespondenId,
      responden_id,
      respondenNik,
      namaKegiatan: rawNamaKegiatan,
      activityName,
      activity_name,
      cabangOlahraga: rawCabangOlahraga,
      sportBranch,
      cabor,
      tingkatPenyelenggaraan: rawTingkat,
      tingkat,
      level,
      medali: rawMedali,
      medal,
      sumberPendanaan: rawSumberPendanaan,
      sumberPembiayaan,
      fundingSource,
      uraianCapaian: rawUraianCapaian,
      prestasi,
      achievements
    } = body;

    const respondenId = rawRespondenId || responden_id || body.responden;
    const namaKegiatan = rawNamaKegiatan || activityName || activity_name || body.nama_kegiatan;
    const cabangOlahraga = rawCabangOlahraga || sportBranch || cabor || body.branch || body.cabang;
    const tingkatPenyelenggaraan = rawTingkat || tingkat || level;
    const medali = rawMedali || medal || "";
    const sumberPendanaan = rawSumberPendanaan || sumberPembiayaan || fundingSource || "APBD (Daerah)";
    const uraianCapaian = rawUraianCapaian || prestasi || achievements || "";

    const parsedCat = parseInt(targetCatId, 10);
    const catIdNum = isNaN(parsedCat) ? 1 : parsedCat;

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
      // Periksa keberadaan data dan proteksi status data sah
      const existingRecord = await prisma.categoryRecord.findUnique({
        where: { id: body.id },
      });

      if (!existingRecord) {
        return NextResponse.json({ error: "Data entri tidak ditemukan." }, { status: 404 });
      }

      const isSah =
        existingRecord.status === RecordStatus.SAH_TERVERIFIKASI ||
        existingRecord.status === RecordStatus.SAH ||
        existingRecord.status === RecordStatus.DISETUJUI;

      if (isSah && payload.role === "OPERATOR") {
        return NextResponse.json(
          { error: "Data yang telah berstatus Sah & Terverifikasi tidak dapat diedit kembali." },
          { status: 403 }
        );
      }

      // Update data jika id dikirimkan & otomatis ubah status ke MENUNGGU_REVIEW
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
          status: RecordStatus.MENUNGGU_REVIEW,
        }
      });
      return NextResponse.json({
        success: true,
        id: updatedRecord.id,
        recordId: updatedRecord.id,
        data: updatedRecord,
        record: updatedRecord
      });
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
      return NextResponse.json({
        success: true,
        id: newRecord.id,
        recordId: newRecord.id,
        data: newRecord,
        record: newRecord
      }, { status: 201 });
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
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id || body?.recordId;
      } catch (e) {
        // body might be empty or invalid json
      }
    }

    if (!id) return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    if (payload.role === "OPERATOR") {
      const existingCatRecord = await prisma.categoryRecord.findUnique({ where: { id } });
      if (existingCatRecord) {
        const isSah =
          existingCatRecord.status === RecordStatus.SAH_TERVERIFIKASI ||
          existingCatRecord.status === RecordStatus.SAH ||
          existingCatRecord.status === RecordStatus.DISETUJUI;
        if (isSah) {
          return NextResponse.json(
            { error: "Data yang telah berstatus Sah & Terverifikasi tidak dapat dihapus." },
            { status: 403 }
          );
        }
      } else {
        const existingResponden = await prisma.responden.findUnique({ where: { id } });
        if (existingResponden) {
          const isSah =
            existingResponden.status === RecordStatus.SAH_TERVERIFIKASI ||
            existingResponden.status === RecordStatus.SAH ||
            existingResponden.status === RecordStatus.DISETUJUI;
          if (isSah) {
            return NextResponse.json(
              { error: "Data responden yang telah berstatus Sah & Terverifikasi tidak dapat dihapus." },
              { status: 403 }
            );
          }
        }
      }
    }

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

