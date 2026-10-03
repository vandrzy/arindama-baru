import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan login kembali." },
        { status: 401 }
      );
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Sesi tidak valid." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("respondenId") || searchParams.get("submissionId");
    const formType = searchParams.get("formType");
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");

    if (!targetId || formType === null || formType === undefined) {
      return NextResponse.json(
        { error: "Parameter respondenId dan formType wajib diisi." },
        { status: 400 }
      );
    }

    const responden = await prisma.responden.findFirst({
      where: {
        OR: [{ id: targetId }, { nik: targetId }],
      },
      select: { id: true },
    });

    if (!responden) {
      return NextResponse.json(
        { error: "Responden tidak ditemukan." },
        { status: 404 }
      );
    }

    const page = pageStr ? Math.max(1, parseInt(pageStr)) : 1;
    const limit = limitStr ? parseInt(limitStr) : 0;
    const skip = (page - 1) * limit;

    const categoryIdNum = parseInt(formType);

    const totalCount = await prisma.categoryRecord.count({
      where: {
        respondenId: responden.id,
        categoryId: categoryIdNum,
      },
    });

    const queryOpts: any = {
      where: {
        respondenId: responden.id,
        categoryId: categoryIdNum,
      },
      orderBy: {
        createdAt: "asc",
      },
    };

    if (limit > 0) {
      queryOpts.take = limit;
      queryOpts.skip = skip;
    }

    // Fetch Category Records
    const records = await prisma.categoryRecord.findMany(queryOpts);

    const formattedRecords = records.map((rec) => {
      const item: Record<string, any> = {
        "Nama Kegiatan/ Kejuaraan Olahraga": rec.namaKegiatan,
        "Cabang Olahraga": rec.cabangOlahraga,
        "Tingkat Penyelenggaraan": rec.tingkatPenyelenggaraan,
        "Sumber Pendanaan": rec.sumberPendanaan,
      };

      if (categoryIdNum === 2 || categoryIdNum === 7) {
        item["Medali"] = rec.medali || "-";
      }

      item["Uraian Capaian"] = rec.uraianCapaian;
      item["Status"] = rec.status;
      return item;
    });

    return NextResponse.json({
      success: true,
      records: formattedRecords,
      totalRecords: totalCount,
      currentPage: page,
      totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
    });
  } catch (error) {
    console.error("Get records error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

