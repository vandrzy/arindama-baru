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

    // 2. Base filter for CategoryRecords
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

    // 3. Fetch data
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

    const totalDataMasuk = allRecords.length;
    const totalDataTerverifikasi = allRecords.filter(r => isVerifiedStatus(r.status)).length;
    const persentaseTerverifikasi = totalDataMasuk > 0 
      ? ((totalDataTerverifikasi / totalDataMasuk) * 100).toFixed(1) 
      : "0.0";

    let medaliSah = { emas: 0, perak: 0, perunggu: 0, total: 0 };
    
    // Aggregation map initialized for ALL 10 Kabupaten/Kota
    const wilayahMap = new Map<string, {
      namaWilayah: string,
      jumlahOperator: Set<string>,
      jumlahResponden: Set<string>,
      medaliEmas: number,
      medaliPerak: number,
      medaliPerunggu: number,
      jumlahMedaliSah: number,
      skor: number
    }>();

    LIST_KAB_KOTA.forEach(kab => {
      wilayahMap.set(kab, {
        namaWilayah: kab,
        jumlahOperator: new Set(),
        jumlahResponden: new Set(),
        medaliEmas: 0,
        medaliPerak: 0,
        medaliPerunggu: 0,
        jumlahMedaliSah: 0,
        skor: 0
      });
    });

    // Fetch verified respondens strictly from Responden table
    const verifiedRespondens = await prisma.responden.findMany({
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
      },
      select: {
        id: true,
        kabupatenKota: true
      }
    });

    const totalResponden = verifiedRespondens.length;

    // Fetch operators
    const allUsers = await prisma.user.findMany({
      where: {
        role: "OPERATOR",
        ...(pilarFilter !== "Semua" ? {
          instansi: { contains: targetInstansi }
        } : {})
      }
    });

    const totalOperator = allUsers.length;

    allUsers.forEach(u => {
      const norm = normalizeWilayah(u.kabupatenKota);
      if (norm && wilayahMap.has(norm)) {
        wilayahMap.get(norm)!.jumlahOperator.add(u.id);
      }
    });

    // Populate respondens count per region from Responden table
    verifiedRespondens.forEach(r => {
      const norm = normalizeWilayah(r.kabupatenKota);
      if (norm && wilayahMap.has(norm)) {
        wilayahMap.get(norm)!.jumlahResponden.add(r.id);
      }
    });

    // Process all CategoryRecords (ONLY verified records count towards medals and scores)
    allRecords.forEach(rec => {
      const verified = isVerifiedStatus(rec.status);

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

        const rawWilayah = rec.responden?.kabupatenKota;
        const norm = normalizeWilayah(rawWilayah);
        const wData = norm ? wilayahMap.get(norm) : null;

        if (wData) {
          if (medaliStr.includes("emas")) {
            wData.medaliEmas++;
            wData.jumlahMedaliSah++;
          } else if (medaliStr.includes("perak")) {
            wData.medaliPerak++;
            wData.jumlahMedaliSah++;
          } else if (medaliStr.includes("perunggu")) {
            wData.medaliPerunggu++;
            wData.jumlahMedaliSah++;
          } else if (medaliStr.includes("partisipasi") || medaliStr.includes("partisipan")) {
            wData.jumlahMedaliSah++;
          }
          
          wData.skor += calculateRecordPoints(rec, weights);
        }
      }
    });

    // Return all 10 regions sorted by score
    const peringkatWilayah = LIST_KAB_KOTA.map(kab => {
      const w = wilayahMap.get(kab)!;
      return {
        namaWilayah: w.namaWilayah,
        jumlahOperator: w.jumlahOperator.size,
        jumlahResponden: w.jumlahResponden.size,
        medaliEmas: w.medaliEmas,
        medaliPerak: w.medaliPerak,
        medaliPerunggu: w.medaliPerunggu,
        jumlahMedaliSah: w.jumlahMedaliSah,
        skor: Math.round(w.skor)
      };
    }).sort((a, b) => b.skor - a.skor);

    return NextResponse.json({
      success: true,
      totalDataMasuk,
      totalDataTerverifikasi,
      persentaseTerverifikasi,
      medaliSah,
      totalOperator,
      totalResponden,
      peringkatWilayah
    });

  } catch (error: any) {
    console.error("GET rekapitulasi-wilayah error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data rekapitulasi wilayah" },
      { status: 500 }
    );
  }
}


