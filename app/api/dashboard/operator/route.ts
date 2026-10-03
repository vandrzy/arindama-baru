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

    // Fetch total respondents for user
    const totalResponden = await prisma.responden.count({
      where: { userId: userId }
    });

    // Fetch respondens for user
    const respondens = await prisma.responden.findMany({
      where: { userId: userId },
      select: { id: true }
    });

    const respondenIds = respondens.map((r: any) => r.id);

    const kategoriNames = [
      "Data Responden",
      "Kejuaraan Pelajar",
      "Peningkatan Mutu SDM",
      "Pelatih Berlisensi",
      "Wasit & Juri Terakreditasi",
      "Penugasan Wasit & Juri",
      "Atlet Tim Nasional",
      "Event Keolahragaan",
      "Olahraga Rekreasi"
    ];

    if (respondenIds.length === 0) {
      return NextResponse.json({
        totalDataInput: 0,
        totalBerkasPdf: 0,
        totalDisetujui: 0,
        menungguReview: 0,
        kategoriStats: Array.from({ length: 9 }, (_, i) => ({ 
          id: i + 1, 
          name: `Kategori ${i + 1} (${kategoriNames[i]})`, 
          uploaded: 0, 
          target: 0 
        })),
        statusKategori: Array.from({ length: 9 }, (_, i) => ({ 
          code: `KAT-0${i + 1}`, 
          title: kategoriNames[i], 
          count: 0, 
          sah: 0 
        })),
        indikatorStats: Array.from({ length: 9 }, (_, i) => ({ 
          id: i + 1, 
          name: `Kategori ${i + 1} (${kategoriNames[i]})`, 
          uploaded: 0, 
          target: 0 
        })),
        status8Indikator: Array.from({ length: 9 }, (_, i) => ({ 
          code: `KAT-0${i + 1}`, 
          title: kategoriNames[i], 
          count: 0, 
          sah: 0 
        }))
      });
    }

    // Fetch CategoryRecords
    const records = await prisma.categoryRecord.findMany({
      where: { respondenId: { in: respondenIds } }
    });

    // Fetch ValidationEvidences
    const evidences = await prisma.validationEvidence.findMany({
      where: { respondenId: { in: respondenIds } }
    });

    // Calculate Stats
    const totalDataInput = records.length;
    const totalBerkasPdf = evidences.length;

    let totalDisetujui = 0;
    let menungguReview = 0;

    const indMap: Record<number, { uploaded: number, sah: number, count: number }> = {};
    for (let i = 1; i <= 9; i++) {
      indMap[i] = { uploaded: 0, sah: 0, count: 0 };
    }

    records.forEach((r: any) => {
      const isSah = ["sah", "sah & terverifikasi", "disetujui", "terunggah"].includes((r.status || "").toLowerCase());
      const isMenunggu = ["menunggu review", "menunggu validasi", "proses"].includes((r.status || "").toLowerCase());
      
      if (isSah) totalDisetujui++;
      if (isMenunggu) menungguReview++;

      if (r.categoryId >= 1 && r.categoryId <= 9) {
        indMap[r.categoryId].count++;
        if (isSah) {
          indMap[r.categoryId].sah++;
        }
      }
    });

    // Count uploaded evidence per category
    evidences.forEach((e: any) => {
      const match = String(e.formType).match(/\d+/);
      const indId = match ? parseInt(match[0]) : null;
      if (indId && indId >= 1 && indId <= 9) {
        indMap[indId].uploaded++;
      }
    });

    const kategoriStats = [];
    const statusKategori = [];

    for (let i = 1; i <= 9; i++) {
      kategoriStats.push({
        id: i,
        name: `Kategori ${i} (${kategoriNames[i-1]})`,
        uploaded: indMap[i].uploaded,
        target: indMap[i].count
      });

      statusKategori.push({
        code: `KAT-0${i}`,
        title: kategoriNames[i-1],
        count: indMap[i].count,
        sah: indMap[i].sah
      });
    }

    const recentSubmissions = await prisma.categoryRecord.findMany({
      where: { respondenId: { in: respondenIds } },
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
      kategoriStats,
      statusKategori,
      indikatorStats: kategoriStats,
      status8Indikator: statusKategori,
      recentSubmissions
    });
  } catch (error) {
    console.error("Dashboard operator error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

