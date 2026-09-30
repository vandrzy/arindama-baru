import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyJwtToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;

    // 2. Fetch total respondents for user
    const totalResponden = await prisma.responden.count({
      where: { userId: userId }
    });

    // 3. Fetch submissions for user
    const submissions = await prisma.submission.findMany({
      where: { userId: userId },
      select: { id: true }
    });

    const submissionIds = submissions.map((s: any) => s.id);

    const indikatorNames = [
      "Biodata Operator",
      "Kejuaraan Pelajar",
      "Peningkatan Mutu SDM",
      "Pelatih Bawa Tim",
      "Wasit Nasional/Intl",
      "Wasit Bertugas",
      "Tenaga Kesehatan",
      "Organisasi Olahraga"
    ];

    if (submissionIds.length === 0) {
      return NextResponse.json({
        totalDataInput: 0,
        totalBerkasPdf: 0,
        totalDisetujui: 0,
        menungguReview: 0,
        indikatorStats: Array.from({ length: 8 }, (_, i) => ({ 
          id: i + 1, 
          name: `Indikator ${i + 1} (${indikatorNames[i]})`, 
          uploaded: 0, 
          target: 0 
        })),
        status8Indikator: Array.from({ length: 8 }, (_, i) => ({ 
          code: `IND-0${i + 1}`, 
          title: indikatorNames[i], 
          count: 0, 
          sah: 0 
        }))
      });
    }

    // 4. Fetch IndicatorRecords
    const records = await prisma.indicatorRecord.findMany({
      where: { submissionId: { in: submissionIds } }
    });

    // 5. Fetch ValidationEvidences
    const evidences = await prisma.validationEvidence.findMany({
      where: { submissionId: { in: submissionIds } }
    });

    // 6. Calculate Stats
    const totalDataInput = records.length;
    const totalBerkasPdf = evidences.length;

    let totalDisetujui = 0;
    let menungguReview = 0;

    const indMap: Record<number, { uploaded: number, sah: number, count: number }> = {};
    for (let i = 1; i <= 8; i++) {
      indMap[i] = { uploaded: 0, sah: 0, count: 0 };
    }

    records.forEach((r: any) => {
      const isSah = ["sah", "sah & terverifikasi", "disetujui", "terunggah"].includes((r.status || "").toLowerCase());
      const isMenunggu = ["menunggu review", "menunggu validasi", "proses"].includes((r.status || "").toLowerCase());
      
      if (isSah) totalDisetujui++;
      if (isMenunggu) menungguReview++;

      if (r.indicatorId >= 1 && r.indicatorId <= 8) {
        indMap[r.indicatorId].count++;
        if (isSah) {
          indMap[r.indicatorId].sah++;
        }
      }
    });

    // Count uploaded evidence per indicator
    evidences.forEach((e: any) => {
      // formType usually looks like "Indikator 1" or just "1"
      const match = String(e.formType).match(/\d+/);
      const indId = match ? parseInt(match[0]) : null;
      if (indId && indId >= 1 && indId <= 8) {
        indMap[indId].uploaded++;
      }
    });



    const indikatorStats = [];
    const status8Indikator = [];

    for (let i = 1; i <= 8; i++) {
      indikatorStats.push({
        id: i,
        name: `Indikator ${i} (${indikatorNames[i-1]})`,
        uploaded: indMap[i].uploaded,
        target: indMap[i].count // The target is the number of data entries inputted
      });

      status8Indikator.push({
        code: `IND-0${i}`,
        title: indikatorNames[i-1],
        count: indMap[i].count,
        sah: indMap[i].sah
      });
    }

    const recentSubmissions = await prisma.indicatorRecord.findMany({
      where: { submissionId: { in: submissionIds } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        responden: { select: { nama: true } }
      }
    });

    return NextResponse.json({
      totalResponden,
      totalDataInput,
      totalBerkasPdf,
      totalDisetujui,
      menungguReview,
      indikatorStats,
      status8Indikator,
      recentSubmissions
    });
  } catch (error) {
    console.error("Dashboard operator error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
