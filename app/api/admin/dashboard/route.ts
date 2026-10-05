import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const DEFAULT_WEIGHTS = [
  { tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
];

const PRISMA_VERIFIED_STATUSES: RecordStatus[] = [
  RecordStatus.SAH_TERVERIFIKASI,
  RecordStatus.SAH,
  RecordStatus.DISETUJUI,
];

const VERIFIED_STATUS_STRINGS = [
  RecordStatus.SAH_TERVERIFIKASI,
  RecordStatus.SAH,
  RecordStatus.DISETUJUI,
  "Sah & Terverifikasi",
  "Sah",
  "Disetujui",
  "SAH_TERVERIFIKASI",
  "SAH",
  "DISETUJUI"
];

const LIST_KAB_KOTA = [
  "Samarinda", "Balikpapan", "Bontang", "Kutai Kartanegara", 
  "Berau", "Kutai Timur", "Paser", "Penajam Paser Utara", 
  "Kutai Barat", "Mahakam Ulu"
];

function isVerifiedStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return VERIFIED_STATUS_STRINGS.includes(status);
}

function normalizeWilayah(rawName: string | null | undefined): string | null {
  if (!rawName) return null;
  const cleaned = rawName.replace(/^(Kota|Kab\.|Kabupaten)\s+/i, "").trim().toLowerCase();
  for (const official of LIST_KAB_KOTA) {
    if (official.toLowerCase() === cleaned || cleaned.includes(official.toLowerCase()) || official.toLowerCase().includes(cleaned)) {
      return official;
    }
  }
  return null;
}

function calculateRecordPoints(rec: any, dynamicWeightsList: any[]): number {
  if (!rec) return 0;
  const tingkatStr = (rec.tingkatPenyelenggaraan || "").toLowerCase();

  let targetPilar = "PRESTASI";
  if (rec.categoryId === 2 || rec.categoryId === 7) targetPilar = "DISABILITAS";
  if (rec.categoryId === 3 || rec.categoryId === 8) targetPilar = "REKREASI";

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

    // 2. Base filter for CategoryRecords by Pilar
    const targetInstansi =
      pilarFilter === "Prestasi (KONI)" ? "KONI" :
      pilarFilter === "Masyarakat (KORMI)" ? "KORMI" :
      pilarFilter === "Disabilitas (NPC)" ? "NPC" :
      pilarFilter === "Dispora" ? "Dispora" : pilarFilter;

    let instansiFilter = {};
    if (pilarFilter !== "Semua") {
      instansiFilter = {
        responden: {
          user: {
            instansi: {
              contains: targetInstansi
            }
          }
        }
      };
    }

    // 3. Fetch data for records
    const allRecords = await prisma.categoryRecord.findMany({
      where: instansiFilter,
      include: {
        responden: {
          include: {
            user: true
          }
        }
      }
    });

    const totalDataTerverifikasi = allRecords.filter(r => isVerifiedStatus(r.status)).length;
    
    const antreanValidasi = allRecords.filter(r => 
      ["Menunggu Validasi", "Perlu Revisi", "Menunggu Review", "Revisi", "MENUNGGU_REVIEW", "REVISI"].includes(r.status)
    ).length;

    let medaliSah = { emas: 0, perak: 0, perunggu: 0, total: 0 };
    
    // Total Operator & Responden (Only verified respondens)
    const allUsers = await prisma.user.findMany({
      where: {
        role: "OPERATOR",
        ...(pilarFilter !== "Semua" ? {
          instansi: { contains: targetInstansi }
        } : {})
      }
    });
    const totalOperator = allUsers.length;

    const totalResponden = await prisma.responden.count({
      where: {
        ...(pilarFilter !== "Semua" ? {
          user: {
            instansi: { contains: targetInstansi }
          }
        } : {}),
        OR: [
          { status: { in: PRISMA_VERIFIED_STATUSES } },
          {
            categoryRecords: {
              some: {
                status: { in: PRISMA_VERIFIED_STATUSES }
              }
            }
          }
        ]
      }
    });

    // Pilar Scores and Composite Score
    const pilarScores = {
      KONI: 0,
      NPC: 0,
      KORMI: 0,
      Dispora: 0,
      Semua: 0
    };

    // Aggregation by 10 Kabupaten/Kota (strictly from Responden database table)
    const wilayahMap = new Map<string, {
      namaWilayah: string,
      skor: number
    }>();

    LIST_KAB_KOTA.forEach(kab => {
      wilayahMap.set(kab, { namaWilayah: kab, skor: 0 });
    });

    let totalKomposit = 0;

    allRecords.forEach(rec => {
      const verified = isVerifiedStatus(rec.status);
      
      // ONLY include verified records for stats, medals, and scores
      if (verified) {
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

        const score = calculateRecordPoints(rec, weights);
        totalKomposit += score;

        const user = rec.responden?.user;
        const instansi = (user?.instansi || "").toUpperCase();
        if (instansi.includes("KONI")) pilarScores.KONI += score;
        else if (instansi.includes("NPC")) pilarScores.NPC += score;
        else if (instansi.includes("KORMI")) pilarScores.KORMI += score;
        else if (instansi.includes("DISPORA")) pilarScores.Dispora += score;
        else {
          if (rec.categoryId === 2 || rec.categoryId === 7) pilarScores.KONI += score;
          else if (rec.categoryId === 3 || rec.categoryId === 8) pilarScores.KORMI += score;
          else pilarScores.Dispora += score;
        }

        // Must derive region from Responden table (rec.responden.kabupatenKota)
        const rawWilayah = rec.responden?.kabupatenKota;
        const normWilayah = normalizeWilayah(rawWilayah);
        if (normWilayah && wilayahMap.has(normWilayah)) {
          wilayahMap.get(normWilayah)!.skor += score;
        }
      }
    });

    // Ensure all 10 regions are returned, sorted by score descending
    const chartWilayah = LIST_KAB_KOTA.map(kab => {
      const w = wilayahMap.get(kab)!;
      return {
        namaWilayah: w.namaWilayah,
        skor: Math.round(w.skor)
      };
    }).sort((a, b) => b.skor - a.skor);

    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    
    // Recent Submissions (Displaying all records, both verified and unverified)
    let filteredRecent = [...allRecords];
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredRecent = filteredRecent.filter(r => {
        const kejuaraan = (r.namaKegiatan || "").toLowerCase();
        const peserta = (r.responden?.nama || r.responden?.user?.nama || "").toLowerCase();
        const cabor = (r.cabangOlahraga || "").toLowerCase();
        return kejuaraan.includes(lowerSearch) || peserta.includes(lowerSearch) || cabor.includes(lowerSearch);
      });
    }

    filteredRecent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const totalRecentSubmissions = filteredRecent.length;
    const totalPages = Math.ceil(totalRecentSubmissions / limit);
    const startIndex = (page - 1) * limit;
    
    const recentSubmissions = filteredRecent
      .slice(startIndex, startIndex + limit)
      .map(r => ({
        id: r.id,
        operator: r.responden?.nama || r.responden?.user?.nama || "Tanpa Nama",
        peserta: r.responden?.nama || r.responden?.user?.nama || "Tanpa Nama",
        instansi: r.responden?.user?.instansi || "-",
        kategori: r.categoryId === 2 ? "Kategori 2 (Kejuaraan Atlet Pelajar Berjenjang)" : "Kategori 7 (Atlet Daerah Mewakili Kontingen & Timnas)",
        kejuaraan: r.namaKegiatan || "-",
        cabor: r.cabangOlahraga || "-",
        medali: r.medali || "-",
        status: r.status,
        tingkat: r.tingkatPenyelenggaraan || "-",
        createdAt: r.createdAt
      }));

    return NextResponse.json({
      success: true,
      totalKomposit: Math.round(totalKomposit),
      totalOperator,
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
      recentSubmissions,
      pagination: {
        page,
        limit,
        total: totalRecentSubmissions,
        totalPages: totalPages === 0 ? 1 : totalPages
      }
    });

  } catch (error: any) {
    console.error("GET dashboard api error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard admin" },
      { status: 500 }
    );
  }
}


