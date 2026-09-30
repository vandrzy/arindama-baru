import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const {
      indicatorId,
      respondenNik,
      namaKegiatan,
      cabangOlahraga,
      tingkatPenyelenggaraan,
      medali,
      sumberPendanaan,
      uraianCapaian
    } = body;

    if (!indicatorId || !respondenNik || !namaKegiatan || !cabangOlahraga || !tingkatPenyelenggaraan) {
      return NextResponse.json({ error: "Kolom wajib belum diisi." }, { status: 400 });
    }

    // Cari submission aktif untuk user di tahun ini
    const tahunSurvei = new Date().getFullYear();
    let submission = await prisma.submission.findFirst({
      where: {
        userId: payload.id,
        tahunSurvei
      }
    });

    if (!submission) {
      submission = await prisma.submission.create({
        data: {
          userId: payload.id,
          tahunSurvei,
        }
      });
    }

    if (body.id) {
      // Update data jika id dikirimkan
      const updatedRecord = await prisma.indicatorRecord.update({
        where: { id: body.id },
        data: {
          indicatorId: parseInt(indicatorId, 10),
          respondenNik,
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
      // Buat IndicatorRecord baru
      const newRecord = await prisma.indicatorRecord.create({
        data: {
          submissionId: submission.id,
          indicatorId: parseInt(indicatorId, 10),
          respondenNik,
          namaKegiatan,
          cabangOlahraga,
          tingkatPenyelenggaraan,
          medali: medali || "",
          sumberPendanaan: sumberPendanaan || "APBD (Daerah)",
          uraianCapaian: uraianCapaian || "",
          status: "Menunggu Review"
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

    await prisma.indicatorRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/records/manual error:", error);
    return NextResponse.json({ error: "Gagal menghapus entri." }, { status: 500 });
  }
}
