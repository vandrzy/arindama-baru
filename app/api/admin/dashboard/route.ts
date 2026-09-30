import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_WEIGHTS = [
  { tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
];

function calculateRecordPoints(rec: any, dynamicWeightsList: any[]): number {
  if (!rec) return 0;
  const tingkatStr = (rec.tingkatPenyelenggaraan || "").toLowerCase();

  let targetPilar = "PRESTASI";
  if (rec.indicatorId === 2 || rec.indicatorId === 7) targetPilar = "DISABILITAS";
  if (rec.indicatorId === 3 || rec.indicatorId === 8) targetPilar = "REKREASI";

  let matchedRow = dynamicWeightsList.find((w: any) =>
    (w.pilar ? w.pilar === targetPilar : true) &&
    tingkatStr.includes((w.tingkat || "").toLowerCase())
  );
  if (!matchedRow) {
    matchedRow = dynamicWeightsList.find((w: any) =>
      (w.pilar ? w.pilar === targetPilar : true) && w.tingkat === "Provinsi"
    ) || {
      tingkat: "Provinsi",
      emas: 30,
      perak: 20,
      perunggu: 15,
      partisipasi: 10,
    };
  }

  const medaliStr = (rec.medali || "").toLowerCase();
  if (medaliStr.includes("emas")) return Number(matchedRow.emas);
  if (medaliStr.includes("perak")) return Number(matchedRow.perak);
  if (medaliStr.includes("perunggu")) return Number(matchedRow.perunggu);

  return Number(matchedRow.partisipasi);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const url = new URL(request.url);
    const pilarFilter = url.searchParams.get("pilar") || "Semua";

    // 1. Get dynamic weights
    let weights = DEFAULT_WEIGHTS;
    try {
      const dbWeights = await prisma.dynamicWeight.findMany();
      if (dbWeights && dbWeights.length > 0) {
        weights = dbWeights;
      }
    } catch (e) {
      console.warn("Could not fetch dynamic weights, using default.");
    }

    // 2. Base filter for IndicatorRecords
    let instansiFilter = {};
    if (pilarFilter !== "Semua") {
      instansiFilter = {
        submission: {
          user: {
            instansi: pilarFilter === "Prestasi (KONI)" ? "KONI" :
                     pilarFilter === "Masyarakat (KORMI)" ? "KORMI" :
                     pilarFilter === "Disabilitas (NPC)" ? "NPC" :
                     pilarFilter === "Dispora" ? "Dispora" : pilarFilter
          }
        }
      };
    }

    // 3. Fetch data for records
    const allRecords = await prisma.indicatorRecord.findMany({
      where: instansiFilter,
      include: {
        submission: {
          include: {
            user: true
          }
        }
      }
    });

    const verifiedStatuses = ["Sah & Terverifikasi", "Sah", "Disetujui"];
    const totalDataTerverifikasi = allRecords.filter(r => verifiedStatuses.includes(r.status)).length;
    
    // Antrean Validasi (Menunggu Review, Revisi) - but wait, the prompt says:
    // Tampilkan jumlah berkas berstatus "Menunggu Review" atau "Revisi".
    // Is it based on submission status or record status?
    // IndicatorRecord status uses "Menunggu Validasi" and "Perlu Revisi" ?
    // Let's check status used:
    const antreanValidasi = allRecords.filter(r => r.status === "Menunggu Validasi" || r.status === "Perlu Revisi" || r.status === "Menunggu Review" || r.status === "Revisi").length;

    let medaliSah = { emas: 0, perak: 0, perunggu: 0, total: 0 };
    
    // Total Responden
    const allUsers = await prisma.user.findMany({
      where: {
        role: "RESPONDEN",
        ...(pilarFilter !== "Semua" ? {
          instansi: pilarFilter === "Prestasi (KONI)" ? "KONI" :
                   pilarFilter === "Masyarakat (KORMI)" ? "KORMI" :
                   pilarFilter === "Disabilitas (NPC)" ? "NPC" :
                   pilarFilter === "Dispora" ? "Dispora" : pilarFilter
        } : {})
      }
    });
    const totalResponden = allUsers.length;

    // Pilar Scores and Composite Score
    const pilarScores = {
      KONI: 0,
      NPC: 0,
      KORMI: 0,
      Dispora: 0,
      Semua: 0
    };

    // Aggregation by Kabupaten/Kota
    const wilayahMap = new Map<string, {
      namaWilayah: string,
      skor: number
    }>();

    const listKabKota = [
      "Samarinda", "Balikpapan", "Bontang", "Kutai Kartanegara", 
      "Berau", "Kutai Timur", "Paser", "Penajam Paser Utara", 
      "Kutai Barat", "Mahakam Ulu"
    ];
    listKabKota.forEach(kab => {
      wilayahMap.set(kab, { namaWilayah: kab, skor: 0 });
    });

    allUsers.forEach(u => {
      const namaWilayah = u.kabupatenKota || "";
      if (wilayahMap.has(namaWilayah)) {
        // Just acknowledging the user exists in a valid region if needed, 
        // though we're mostly counting scores later.
      }
    });

    let totalKomposit = 0;

    allRecords.forEach(rec => {
      const medaliStr = (rec.medali || rec.uraianCapaian || "").toLowerCase();
      if (medaliStr.includes("emas")) {
        medaliSah.emas++;
        medaliSah.total++;
      } else if (medaliStr.includes("perak")) {
        medaliSah.perak++;
        medaliSah.total++;
      } else if (medaliStr.includes("perunggu")) {
        medaliSah.perunggu++;
        medaliSah.total++;
      }

      const isVerified = verifiedStatuses.includes(rec.status);
      const isMedalIndicator = rec.indicatorId === 1 || rec.indicatorId === 6;
      const user = rec.submission.user;
      
      if (isVerified || isMedalIndicator) {
        const score = calculateRecordPoints(rec, weights);
        if (isVerified) {
          totalKomposit += score;
        }
        
        const instansi = user.instansi;
        if (instansi === "KONI") pilarScores.KONI += score;
        else if (instansi === "NPC") pilarScores.NPC += score;
        else if (instansi === "KORMI") pilarScores.KORMI += score;
        else if (instansi === "Dispora") pilarScores.Dispora += score;

        const namaWilayah = user.kabupatenKota || "Lainnya";
        let wData = wilayahMap.get(namaWilayah);
        if (wData && isVerified) {
          wData.skor += score;
        }
      }
    });

    // Ensure we only sort and return exactly the 10 regions from our map
    const chartWilayah = Array.from(wilayahMap.values())
      .map(w => ({
        namaWilayah: w.namaWilayah,
        skor: Math.round(w.skor)
      }))
      .sort((a, b) => b.skor - a.skor);

    // Recent Submissions (Indikator 1 & 6)
    // Ordered by createdAt desc, max 5 or 10
    const recentSubmissions = allRecords
      .filter(r => r.indicatorId === 1 || r.indicatorId === 6)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(r => ({
        id: r.id,
        responden: r.submission.user.nama || "Tanpa Nama",
        instansi: r.submission.user.instansi || "-",
        indikator: r.indicatorId === 1 ? "1 (Capaian Prestasi Nasional/Internasional)" : "6 (Capaian Prestasi Daerah)",
        kejuaraan: r.namaKegiatan || "-",
        medali: r.medali || "-",
        status: r.status,
        createdAt: r.createdAt
      }));

    return NextResponse.json({
      success: true,
      totalKomposit: Math.round(totalKomposit),
      totalResponden,
      medaliSah,
      antreanValidasi,
      totalDataTerverifikasi,
      pilarScores: {
        KONI: Math.round(pilarScores.KONI),
        NPC: Math.round(pilarScores.NPC),
        KORMI: Math.round(pilarScores.KORMI),
        Dispora: Math.round(pilarScores.Dispora)
      },
      chartWilayah,
      recentSubmissions
    });

  } catch (error: any) {
    console.error("GET dashboard api error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard admin" },
      { status: 500 }
    );
  }
}
