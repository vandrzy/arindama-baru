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

    // Get user details
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, nama: true, email: true, role: true, kabupatenKota: true, instansi: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // 1. Fetch user's submissions (or all submissions for admin preview)
    const userSubmissions = await prisma.submission.findMany({
      where: { userId: currentUser.id },
      include: {
        respondenIdentity: true,
        indicatorRecords: true,
      },
    });

    // 2. Prepare Admin UI Filter Options (Mock & real user lists)
    let adminFiltersData = {
      listKota: [] as string[],
      listInstansi: [] as string[],
      listResponden: [] as Array<{ id: string; nama: string; email: string; kabupatenKota: string; instansi: string }>,
    };

    if (currentUser.role === "ADMIN") {
      const allUsers = await prisma.user.findMany({
        select: { id: true, nama: true, email: true, kabupatenKota: true, instansi: true },
      });

      const uniqueKota = Array.from(
        new Set(
          allUsers
            .map((u) => u.kabupatenKota)
            .filter((k) => k && k.trim() !== "")
        )
      );
      if (uniqueKota.length === 0) {
        uniqueKota.push("Kota Surabaya", "Kab. Sidoarjo", "Kota Malang", "Kab. Gresik", "Kota Kediri");
      }

      const uniqueInstansi = Array.from(
        new Set(
          allUsers
            .map((u) => u.instansi)
            .filter((i) => i && i.trim() !== "")
        )
      );
      if (uniqueInstansi.length === 0) {
        uniqueInstansi.push("Dispora Provinsi", "KONI Daerah", "Pengprov Cabor", "Dinas Pendidikan");
      }

      adminFiltersData = {
        listKota: uniqueKota,
        listInstansi: uniqueInstansi,
        listResponden: allUsers.map((u) => ({
          id: u.id,
          nama: u.nama,
          email: u.email,
          kabupatenKota: u.kabupatenKota || "Kota Surabaya",
          instansi: u.instansi || "Dispora Daerah",
        })),
      };
    }

    // Process user's submissions data
    // A. Demografi
    const identities = userSubmissions
      .map((s) => s.respondenIdentity)
      .filter((identity): identity is NonNullable<typeof identity> => Boolean(identity));

    const totalResponden = identities.length;

    let jenisKelaminStats = [
      { name: "Laki-laki", value: 0 },
      { name: "Perempuan", value: 0 },
    ];
    let umurStats: Record<string, number> = {
      "< 20 Tahun": 0,
      "20 - 30 Tahun": 0,
      "31 - 40 Tahun": 0,
      "41 - 50 Tahun": 0,
      "> 50 Tahun": 0,
    };
    let pekerjaanMap: Record<string, number> = {};
    let kotaMap: Record<string, number> = {};

    identities.forEach((id) => {
      // Gender
      const jk = (id.jenisKelamin || "").toLowerCase();
      if (jk.includes("perempuan") || jk.includes("wanita") || jk === "p") {
        jenisKelaminStats[1].value += 1;
      } else {
        jenisKelaminStats[0].value += 1;
      }

      // Age
      const u = parseInt(id.umur) || 0;
      if (u > 0) {
        if (u < 20) umurStats["< 20 Tahun"] += 1;
        else if (u <= 30) umurStats["20 - 30 Tahun"] += 1;
        else if (u <= 40) umurStats["31 - 40 Tahun"] += 1;
        else if (u <= 50) umurStats["41 - 50 Tahun"] += 1;
        else umurStats["> 50 Tahun"] += 1;
      }

      // Pekerjaan
      const pk = id.pekerjaanJabatan || "Tidak Diisi";
      pekerjaanMap[pk] = (pekerjaanMap[pk] || 0) + 1;

      // Kota
      const kt = id.kabupatenKotaAsal || "Tidak Diisi";
      kotaMap[kt] = (kotaMap[kt] || 0) + 1;
    });

    // B. Peningkatan Mutu SDM (Indikator 2) & C. Kinerja SDM (Indikator 3, 4, 5)
    const indicatorRecords = userSubmissions.flatMap((s) => s.indicatorRecords);

    // Indikator 2: Peningkatan Mutu SDM
    const mutuRecords = indicatorRecords.filter((r) => r.indicatorId === 2);
    let mutuJenjangMap: Record<string, number> = {
      Provinsi: 0,
      Nasional: 0,
      Internasional: 0,
    };
    let mutuPendanaanMap: Record<string, number> = {};

    mutuRecords.forEach((r) => {
      const level = normalizeLevel(r.tingkatPenyelenggaraan);
      if (level in mutuJenjangMap) {
        mutuJenjangMap[level] = (mutuJenjangMap[level] || 0) + 1;
      } else {
        mutuJenjangMap["Provinsi"] = (mutuJenjangMap["Provinsi"] || 0) + 1;
      }

      const pendanaan = normalizePendanaan(r.sumberPendanaan);
      mutuPendanaanMap[pendanaan] = (mutuPendanaanMap[pendanaan] || 0) + 1;
    });

    // Indikator 3, 4, 5: Kinerja SDM
    const sdmRecords = indicatorRecords.filter((r) => [3, 4, 5].includes(r.indicatorId));
    let sdmJenjangMap: Record<string, number> = {
      Provinsi: 0,
      Nasional: 0,
      Internasional: 0,
    };
    let sdmPendanaanMap: Record<string, number> = {};

    sdmRecords.forEach((r) => {
      const level = normalizeLevel(r.tingkatPenyelenggaraan);
      if (level in sdmJenjangMap) {
        sdmJenjangMap[level] = (sdmJenjangMap[level] || 0) + 1;
      } else {
        sdmJenjangMap["Provinsi"] = (sdmJenjangMap["Provinsi"] || 0) + 1;
      }

      const pendanaan = normalizePendanaan(r.sumberPendanaan);
      sdmPendanaanMap[pendanaan] = (sdmPendanaanMap[pendanaan] || 0) + 1;
    });

    // C. Prestasi Atlet (Indikator 1 dan 6)
    const atletRecords = indicatorRecords.filter((r) => [1, 6].includes(r.indicatorId));

    // Medal structure by level
    const medalStats = {
      Internasional: { Emas: 0, Perak: 0, Perunggu: 0, Partisipasi: 0 },
      Nasional: { Emas: 0, Perak: 0, Perunggu: 0, Partisipasi: 0 },
      Provinsi: { Emas: 0, Perak: 0, Perunggu: 0, Partisipasi: 0 },
    };

    let totalBobotScore = 0;

    atletRecords.forEach((r) => {
      const level = normalizeLevel(r.tingkatPenyelenggaraan);
      const medal = normalizeMedal(r.medali || r.uraianCapaian);

      let keyLevel: "Internasional" | "Nasional" | "Provinsi" = "Provinsi";
      if (level === "Internasional") keyLevel = "Internasional";
      else if (level === "Nasional") keyLevel = "Nasional";

      if (medal === "Emas") {
        medalStats[keyLevel].Emas += 1;
        if (keyLevel === "Internasional") totalBobotScore += 10;
        else if (keyLevel === "Nasional") totalBobotScore += 5;
        else totalBobotScore += 3;
      } else if (medal === "Perak") {
        medalStats[keyLevel].Perak += 1;
        if (keyLevel === "Internasional") totalBobotScore += 8;
        else if (keyLevel === "Nasional") totalBobotScore += 4;
        else totalBobotScore += 2;
      } else if (medal === "Perunggu") {
        medalStats[keyLevel].Perunggu += 1;
        if (keyLevel === "Internasional") totalBobotScore += 5;
        else if (keyLevel === "Nasional") totalBobotScore += 3;
        else totalBobotScore += 1;
      } else {
        medalStats[keyLevel].Partisipasi += 1;
      }
    });

    // D. Penyelenggara Event Olahraga (Indikator 7)
    const eventRecords = indicatorRecords.filter((r) => r.indicatorId === 7);
    let eventPendanaanMap: Record<string, number> = {};
    let eventTingkatMap: Record<string, number> = {};

    eventRecords.forEach((r) => {
      const p = normalizePendanaan(r.sumberPendanaan);
      eventPendanaanMap[p] = (eventPendanaanMap[p] || 0) + 1;

      const t = normalizeLevel(r.tingkatPenyelenggaraan);
      eventTingkatMap[t] = (eventTingkatMap[t] || 0) + 1;
    });

    // E. Prestasi Kejuaraan (Indikator 8)
    const kejuaraanRecords = indicatorRecords.filter((r) => r.indicatorId === 8);
    let kejuaraanPendanaanMap: Record<string, number> = {};
    let kejuaraanTingkatMap: Record<string, number> = {};

    kejuaraanRecords.forEach((r) => {
      const p = normalizePendanaan(r.sumberPendanaan);
      kejuaraanPendanaanMap[p] = (kejuaraanPendanaanMap[p] || 0) + 1;

      const t = normalizeLevel(r.tingkatPenyelenggaraan);
      kejuaraanTingkatMap[t] = (kejuaraanTingkatMap[t] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      currentUser: {
        id: currentUser.id,
        nama: currentUser.nama,
        email: currentUser.email,
        role: currentUser.role,
        kabupatenKota: currentUser.kabupatenKota,
        instansi: currentUser.instansi,
      },
      adminFiltersData,
      data: {
        demografi: {
          totalResponden,
          identitiesList: identities,
          jenisKelaminStats,
          umurStats: Object.entries(umurStats).map(([name, value]) => ({ name, value })),
          pekerjaanStats: Object.entries(pekerjaanMap).map(([name, value]) => ({ name, value })),
          kotaStats: Object.entries(kotaMap).map(([name, value]) => ({ name, value })),
        },
        mutuSDM: {
          totalRecords: mutuRecords.length,
          jenjangPenugasanStats: Object.entries(mutuJenjangMap).map(([name, value]) => ({ name, value })),
          sumberPendanaanStats: Object.entries(mutuPendanaanMap).map(([name, value]) => ({ name, value })),
        },
        kinerjaSDM: {
          totalRecords: sdmRecords.length,
          jenjangPenugasanStats: Object.entries(sdmJenjangMap).map(([name, value]) => ({ name, value })),
          sumberPendanaanStats: Object.entries(sdmPendanaanMap).map(([name, value]) => ({ name, value })),
        },
        prestasiAtlet: {
          totalRecords: atletRecords.length,
          medalStats,
          totalBobotScore,
          atletChartData: [
            {
              jenjang: "Internasional",
              Emas: medalStats.Internasional.Emas,
              Perak: medalStats.Internasional.Perak,
              Perunggu: medalStats.Internasional.Perunggu,
              Partisipasi: medalStats.Internasional.Partisipasi,
            },
            {
              jenjang: "Nasional",
              Emas: medalStats.Nasional.Emas,
              Perak: medalStats.Nasional.Perak,
              Perunggu: medalStats.Nasional.Perunggu,
              Partisipasi: medalStats.Nasional.Partisipasi,
            },
            {
              jenjang: "Provinsi",
              Emas: medalStats.Provinsi.Emas,
              Perak: medalStats.Provinsi.Perak,
              Perunggu: medalStats.Provinsi.Perunggu,
              Partisipasi: medalStats.Provinsi.Partisipasi,
            },
          ],
        },
        eventOlahraga: {
          totalRecords: eventRecords.length,
          sumberPendanaanStats: Object.entries(eventPendanaanMap).map(([name, value]) => ({ name, value })),
          tingkatKejuaraanStats: Object.entries(eventTingkatMap).map(([name, value]) => ({ name, value })),
        },
        prestasiKejuaraan: {
          totalRecords: kejuaraanRecords.length,
          sumberPendanaanStats: Object.entries(kejuaraanPendanaanMap).map(([name, value]) => ({ name, value })),
          tingkatKejuaraanStats: Object.entries(kejuaraanTingkatMap).map(([name, value]) => ({ name, value })),
        },
      },
    });
  } catch (error) {
    console.error("Get statistik error:", error);
    return NextResponse.json({ error: "Gagal mengambil data statistik." }, { status: 500 });
  }
}

// Helper normalizers
function normalizeLevel(val?: string): string {
  if (!val) return "Kabupaten/Kota";
  const s = val.toLowerCase();
  if (s.includes("internasional")) return "Internasional";
  if (s.includes("nasional")) return "Nasional";
  if (s.includes("provinsi")) return "Provinsi";
  return "Kabupaten/Kota";
}

function normalizePendanaan(val?: string): string {
  if (!val) return "Mandiri / Lainnya";
  const s = val.toLowerCase();
  if (s.includes("apbd")) return "APBD";
  if (s.includes("apbn")) return "APBN";
  if (s.includes("sponsor")) return "Sponsor / Swasta";
  if (s.includes("mandiri")) return "Mandiri";
  if (s.includes("hibah")) return "Hibah";
  return val.trim() || "Mandiri / Lainnya";
}

function normalizeMedal(val?: string): string {
  if (!val) return "Partisipasi";
  const s = val.toLowerCase();
  if (s.includes("emas") || s.includes("gold")) return "Emas";
  if (s.includes("perak") || s.includes("silver")) return "Perak";
  if (s.includes("perunggu") || s.includes("bronze")) return "Perunggu";
  return "Partisipasi";
}
