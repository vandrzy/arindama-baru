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
    const submissionId = searchParams.get("submissionId");
    const formType = searchParams.get("formType");
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");

    if (!submissionId || formType === null || formType === undefined) {
      return NextResponse.json(
        { error: "Parameter submissionId dan formType wajib diisi." },
        { status: 400 }
      );
    }

    const page = pageStr ? Math.max(1, parseInt(pageStr)) : 1;
    const limit = limitStr ? parseInt(limitStr) : 0;
    const skip = (page - 1) * limit;

    const indicatorIdNum = parseInt(formType);

    if (indicatorIdNum === 0 || formType === "IdentitasResponden") {
      const totalCount = await prisma.respondenIdentity.count({
        where: { submissionId },
      });

      const queryOpts: any = {
        where: { submissionId },
        orderBy: { createdAt: "asc" },
      };

      if (limit > 0) {
        queryOpts.take = limit;
        queryOpts.skip = skip;
      }

      // Fetch Responden Identity
      const identities = await prisma.respondenIdentity.findMany(queryOpts);

      if (!identities || identities.length === 0) {
        return NextResponse.json({
          success: true,
          records: [],
          totalRecords: totalCount,
          currentPage: page,
          totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
        });
      }

      const formattedRecords = identities.map((identity) => ({
        "Nama Lengkap & Gelar": identity.namaLengkap,
        "Jenis Kelamin": identity.jenisKelamin,
        "Tanggal Lahir": identity.tanggalLahir,
        "Umur": identity.umur,
        "Kabupaten/ Kota Asal": identity.kabupatenKotaAsal,
        "Kecamatan": identity.kecamatan,
        "Pekerjaan/ Jabatan di Bidang Olahraga": identity.pekerjaanJabatan,
        "Nomor Telepon/ Whatsapp Aktif": identity.nomorTelepon,
      }));

      return NextResponse.json({
        success: true,
        records: formattedRecords,
        totalRecords: totalCount,
        currentPage: page,
        totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
      });
    } else {
      const totalCount = await prisma.indicatorRecord.count({
        where: {
          submissionId,
          indicatorId: indicatorIdNum,
        },
      });

      const queryOpts: any = {
        where: {
          submissionId,
          indicatorId: indicatorIdNum,
        },
        orderBy: {
          createdAt: "asc",
        },
      };

      if (limit > 0) {
        queryOpts.take = limit;
        queryOpts.skip = skip;
      }

      // Fetch Indicator Records
      const records = await prisma.indicatorRecord.findMany(queryOpts);

      const formattedRecords = records.map((rec) => {
        const item: Record<string, any> = {
          "Nama Kegiatan/ Kejuaraan Olahraga": rec.namaKegiatan,
          "Cabang Olahraga": rec.cabangOlahraga,
          "Tingkat Penyelenggaraan": rec.tingkatPenyelenggaraan,
          "Sumber Pendanaan": rec.sumberPendanaan,
        };

        if (indicatorIdNum === 1 || indicatorIdNum === 6) {
          item["Medali"] = rec.medali || "-";
        }

        item["Uraian Capaian"] = rec.uraianCapaian;
        return item;
      });

      return NextResponse.json({
        success: true,
        records: formattedRecords,
        totalRecords: totalCount,
        currentPage: page,
        totalPages: limit > 0 ? Math.ceil(totalCount / limit) : 1,
      });
    }
  } catch (error) {
    console.error("Get records error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
