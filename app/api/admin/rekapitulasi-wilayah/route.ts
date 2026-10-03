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
    const tingkatWilayahFilter = url.searchParams.get("tingkat") || "Tingkat 2";

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
      // mapping instansi filter
      instansiFilter = {
        responden: {
          user: {
            instansi: pilarFilter === "Prestasi (KONI)" ? "KONI" :
                     pilarFilter === "Masyarakat (KORMI)" ? "KORMI" :
                     pilarFilter === "Disabilitas (NPC)" ? "NPC" :
                     pilarFilter === "Dispora" ? "Dispora" : pilarFilter
          }
        }
      };
    }

    // 3. Fetch data
    const allRecords = await prisma.indicatorRecord.findMany({
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
    const verifiedStatuses = ["Sah & Terverifikasi", "Sah", "Disetujui"];
    const totalDataTerverifikasi = allRecords.filter(r => verifiedStatuses.includes(r.status)).length;
    const persentaseTerverifikasi = totalDataMasuk > 0 
      ? ((totalDataTerverifikasi / totalDataMasuk) * 100).toFixed(1) 
      : "0.0";

    let medaliSah = { emas: 0, perak: 0, perunggu: 0, total: 0 };
    
    // Aggregation by Kabupaten/Kota (or Province)
    const wilayahMap = new Map<string, {
      namaWilayah: string,
      jumlahOperator: Set<string>,
      jumlahResponden: number,
      medaliEmas: number,
      medaliPerak: number,
      medaliPerunggu: number,
      jumlahMedaliSah: number,
      skor: number
    }>();

    // Fetch respondens from database
    const allRespondens = await prisma.responden.findMany({
      select: {
        id: true,
        nik: true,
        kabupatenKota: true
      }
    });

    const totalResponden = allRespondens.length;

    // Init map with all OPERATOR users to ensure regions exist
    const allUsers = await prisma.user.findMany({
      where: {
        role: "OPERATOR",
        ...(pilarFilter !== "Semua" ? {
          instansi: pilarFilter === "Prestasi (KONI)" ? "KONI" :
                   pilarFilter === "Masyarakat (KORMI)" ? "KORMI" :
                   pilarFilter === "Disabilitas (NPC)" ? "NPC" :
                   pilarFilter === "Dispora" ? "Dispora" : pilarFilter
        } : {})
      }
    });

    const totalOperator = allUsers.length;

    allUsers.forEach(u => {
      const namaWilayah = tingkatWilayahFilter === "Tingkat 3" ? "Kalimantan Timur" : (u.kabupatenKota || "Lainnya");
      if (!wilayahMap.has(namaWilayah)) {
        wilayahMap.set(namaWilayah, {
          namaWilayah,
          jumlahOperator: new Set(),
          jumlahResponden: 0,
          medaliEmas: 0,
          medaliPerak: 0,
          medaliPerunggu: 0,
          jumlahMedaliSah: 0,
          skor: 0
        });
      }
      wilayahMap.get(namaWilayah)!.jumlahOperator.add(u.id);
    });

    // Populate respondens count per region
    allRespondens.forEach(r => {
      const namaWilayah = tingkatWilayahFilter === "Tingkat 3" ? "Kalimantan Timur" : (r.kabupatenKota || "Lainnya");
      let wData = wilayahMap.get(namaWilayah);
      if (!wData) {
        wData = {
          namaWilayah,
          jumlahOperator: new Set(),
          jumlahResponden: 0,
          medaliEmas: 0,
          medaliPerak: 0,
          medaliPerunggu: 0,
          jumlahMedaliSah: 0,
          skor: 0
        };
        wilayahMap.set(namaWilayah, wData);
      }
      wData.jumlahResponden++;
    });

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
      
      const user = rec.responden?.user;
      const namaWilayah = tingkatWilayahFilter === "Tingkat 3" ? "Kalimantan Timur" : (user?.kabupatenKota || "Lainnya");

      let wData = wilayahMap.get(namaWilayah);
      if (!wData) {
        wData = {
          namaWilayah,
          jumlahOperator: new Set(),
          jumlahResponden: 0,
          medaliEmas: 0,
          medaliPerak: 0,
          medaliPerunggu: 0,
          jumlahMedaliSah: 0,
          skor: 0
        };
        wilayahMap.set(namaWilayah, wData);
      }
      if (user) {
        wData.jumlahOperator.add(user.id);
      }

      if (isVerified || isMedalIndicator) {
        if (medaliStr.includes("emas")) {
          wData.medaliEmas++;
          wData.jumlahMedaliSah++;
        } else if (medaliStr.includes("perak")) {
          wData.medaliPerak++;
          wData.jumlahMedaliSah++;
        } else if (medaliStr.includes("perunggu")) {
          wData.medaliPerunggu++;
          wData.jumlahMedaliSah++;
        } else if (medaliStr.includes("partisipan")) {
          wData.jumlahMedaliSah++; 
        }
        
        if (isVerified) {
          wData.skor += calculateRecordPoints(rec, weights);
        }
      }
    });

    const peringkatWilayah = Array.from(wilayahMap.values()).map(w => ({
      namaWilayah: w.namaWilayah,
      jumlahOperator: w.jumlahOperator.size,
      jumlahResponden: w.jumlahResponden,
      medaliEmas: w.medaliEmas,
      medaliPerak: w.medaliPerak,
      medaliPerunggu: w.medaliPerunggu,
      jumlahMedaliSah: w.jumlahMedaliSah,
      skor: w.skor
    })).sort((a, b) => b.skor - a.skor);

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
