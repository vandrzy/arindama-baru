import { prisma } from "@/lib/prisma";
import { KABUPATEN_KOTA_OPTIONS, INSTANSI_OPTIONS } from "@/lib/constants/survey-data";

export interface UserPayload {
  id: string;
  role: string;
  nama: string;
  email: string;
  kabupatenKota: string;
  instansi: string;
}

export interface GetStatistikParams {
  currentUser: UserPayload;
  paramKota?: string;
  paramInstansi?: string;
  paramUserId?: string;
}

export function normalizeLevel(val?: string): string {
  if (!val) return "Kabupaten/Kota";
  const s = val.toLowerCase();
  if (s.includes("internasional")) return "Internasional";
  if (s.includes("nasional")) return "Nasional";
  if (s.includes("provinsi")) return "Provinsi";
  return "Kabupaten/Kota";
}

export function normalizePendanaan(val?: string): string {
  if (!val) return "Mandiri / Lainnya";
  const s = val.toLowerCase();
  if (s.includes("apbd")) return "APBD";
  if (s.includes("apbn")) return "APBN";
  if (s.includes("sponsor")) return "Sponsor / Swasta";
  if (s.includes("mandiri")) return "Mandiri";
  if (s.includes("hibah")) return "Hibah";
  return val.trim() || "Mandiri / Lainnya";
}

export function normalizeMedal(val?: string): string {
  if (!val) return "Partisipasi";
  const s = val.toLowerCase();
  if (s.includes("emas") || s.includes("gold")) return "Emas";
  if (s.includes("perak") || s.includes("silver")) return "Perak";
  if (s.includes("perunggu") || s.includes("bronze")) return "Perunggu";
  return "Partisipasi";
}

/**
 * Optimized retrieval of admin UI filter dropdown options using SQL pushdown (distinct & select)
 */
export async function getAdminFiltersData(paramKota?: string, paramInstansi?: string) {
  const userKota = await prisma.user.findMany({
    where: { kabupatenKota: { not: "" } },
    distinct: ["kabupatenKota"],
    select: { kabupatenKota: true },
  });

  const uniqueKotaSet = new Set<string>(KABUPATEN_KOTA_OPTIONS);
  userKota.forEach((u) => {
    if (u.kabupatenKota?.trim()) uniqueKotaSet.add(u.kabupatenKota.trim());
  });
  const listKota = Array.from(uniqueKotaSet).sort();

  // Distinct Instansi
  const instansiUsers = await prisma.user.findMany({
    where: {
      instansi: { not: "" },
      ...(paramKota ? { kabupatenKota: { equals: paramKota } } : {}),
    },
    distinct: ["instansi"],
    select: { instansi: true },
  });
  const uniqueInstansiSet = new Set<string>(INSTANSI_OPTIONS);
  instansiUsers.forEach((u) => {
    if (u.instansi?.trim()) uniqueInstansiSet.add(u.instansi.trim());
  });
  const listInstansi = Array.from(uniqueInstansiSet).sort();

  // Filtered Operator list
  const operatorUsers = await prisma.user.findMany({
    where: {
      role: "OPERATOR",
      ...(paramKota ? { kabupatenKota: { equals: paramKota } } : {}),
      ...(paramInstansi ? { instansi: { equals: paramInstansi } } : {}),
    },
    select: {
      id: true,
      nama: true,
      email: true,
      kabupatenKota: true,
      instansi: true,
    },
    orderBy: { nama: "asc" },
  });

  const listOperator = operatorUsers.map((u) => ({
    id: u.id,
    nama: u.nama,
    email: u.email,
    kabupatenKota: u.kabupatenKota || "Samarinda",
    instansi: u.instansi || "DISPORA",
  }));

  return {
    listKota,
    listInstansi,
    listOperator,
  };
}

/**
 * Main statistics compilation with optimized DB queries & Map lookups
 */
export async function getStatistikData({
  currentUser,
  paramKota,
  paramInstansi,
  paramUserId,
}: GetStatistikParams) {
  // 1. Build Responden filter condition
  const respondenWhere: any = {};

  if (currentUser.role === "OPERATOR") {
    respondenWhere.userId = currentUser.id;
  } else if (currentUser.role === "ADMIN") {
    if (paramUserId) {
      respondenWhere.userId = paramUserId;
    } else {
      const userWhere: any = {};
      if (paramKota) userWhere.kabupatenKota = paramKota;
      if (paramInstansi) userWhere.instansi = paramInstansi;
      if (Object.keys(userWhere).length > 0) {
        respondenWhere.user = userWhere;
      }
    }
  }

  // Fetch respondens with select
  const matchingRespondens = await prisma.responden.findMany({
    where: respondenWhere,
    select: {
      id: true,
      indicatorRecords: true,
      validationEvidences: true,
    },
  });

  // Build O(1) Evidence Lookup Map with comprehensive alias keys
  const evidenceMap = new Map<string, any>();
  matchingRespondens.forEach((s) => {
    s.validationEvidences.forEach((ev) => {
      if (ev.recordId) {
        evidenceMap.set(`${s.id}:${ev.recordId}`, ev);
        if (ev.formType) {
          evidenceMap.set(`${s.id}:${ev.formType}:${ev.recordId}`, ev);
        }
      }
      if (ev.formType) {
        evidenceMap.set(`${s.id}:${ev.formType}`, ev);

        const numMatch = ev.formType.match(/^(?:indikator[_-]?)?([1-8])$/i);
        if (numMatch) {
          const num = numMatch[1];
          evidenceMap.set(`${s.id}:${num}`, ev);
          evidenceMap.set(`${s.id}:indikator_${num}`, ev);
          if (ev.recordId) {
            evidenceMap.set(`${s.id}:${num}:${ev.recordId}`, ev);
            evidenceMap.set(`${s.id}:indikator_${num}:${ev.recordId}`, ev);
          }
        }
      }
    });
  });

  const getEvidenceForRecord = (
    respondenId: string,
    recordId: string,
    indicatorId: number,
    rowIndex: number
  ) => {
    const indStr = String(indicatorId);
    const indAlias = `indikator_${indicatorId}`;
    const rowKey = `row_${rowIndex}`;

    return (
      evidenceMap.get(`${respondenId}:${recordId}`) ||
      evidenceMap.get(`${respondenId}:${indStr}:${rowKey}`) ||
      evidenceMap.get(`${respondenId}:${indAlias}:${rowKey}`) ||
      evidenceMap.get(`${respondenId}:${indStr}:${recordId}`) ||
      evidenceMap.get(`${respondenId}:${indAlias}:${recordId}`) ||
      null
    );
  };

  // B. Indicators Processing
  const allIndicatorRecords = matchingRespondens.flatMap((s) => s.indicatorRecords);

  // Index row positions per responden and indicatorId
  const respondenIndicatorRowMap = new Map<string, number>();

  const attachEvidenceToRecords = (records: any[]) => {
    return records.map((r) => {
      const key = `${r.respondenId}:${r.indicatorId}`;
      const rowIndex = respondenIndicatorRowMap.get(key) || 0;
      respondenIndicatorRowMap.set(key, rowIndex + 1);

      return {
        ...r,
        validationEvidence: getEvidenceForRecord(
          r.respondenId,
          r.id,
          r.indicatorId,
          rowIndex
        ),
      };
    });
  };

  // Indikator 2: Mutu SDM
  const mutuRecords = allIndicatorRecords.filter((r) => r.indicatorId === 2);
  const mutuJenjangMap: Record<string, number> = { Provinsi: 0, Nasional: 0, Internasional: 0 };
  const mutuPendanaanMap: Record<string, number> = {};

  mutuRecords.forEach((r) => {
    const level = normalizeLevel(r.tingkatPenyelenggaraan);
    mutuJenjangMap[level] = (mutuJenjangMap[level] || 0) + 1;
    const pendanaan = normalizePendanaan(r.sumberPendanaan);
    mutuPendanaanMap[pendanaan] = (mutuPendanaanMap[pendanaan] || 0) + 1;
  });

  // Indikator 3, 4, 5: Kinerja SDM
  const sdmRecords = allIndicatorRecords.filter((r) => [3, 4, 5].includes(r.indicatorId));
  const sdmJenjangMap: Record<string, number> = { Provinsi: 0, Nasional: 0, Internasional: 0 };
  const sdmPendanaanMap: Record<string, number> = {};

  sdmRecords.forEach((r) => {
    const level = normalizeLevel(r.tingkatPenyelenggaraan);
    sdmJenjangMap[level] = (sdmJenjangMap[level] || 0) + 1;
    const pendanaan = normalizePendanaan(r.sumberPendanaan);
    sdmPendanaanMap[pendanaan] = (sdmPendanaanMap[pendanaan] || 0) + 1;
  });

  // Fetch Dynamic Weights
  const dynamicWeights = await prisma.dynamicWeight.findMany();
  // Map them for easier lookup: map[Tingkat] => { emas, perak, perunggu, partisipasi }
  const weightMatrix = {
    Internasional: { emas: 10, perak: 8, perunggu: 5, partisipasi: 0 },
    Nasional: { emas: 5, perak: 4, perunggu: 3, partisipasi: 0 },
    Provinsi: { emas: 3, perak: 2, perunggu: 1, partisipasi: 0 },
  };
  dynamicWeights.forEach(dw => {
    const level = normalizeLevel(dw.tingkat);
    if (level === "Internasional" || level === "Nasional" || level === "Provinsi") {
      weightMatrix[level] = { emas: dw.emas, perak: dw.perak, perunggu: dw.perunggu, partisipasi: dw.partisipasi };
    }
  });

  // Indikator 1, 6: Prestasi Atlet
  const atletRecords = allIndicatorRecords.filter((r) => [1, 6].includes(r.indicatorId));
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
      totalBobotScore += weightMatrix[keyLevel].emas;
    } else if (medal === "Perak") {
      medalStats[keyLevel].Perak += 1;
      totalBobotScore += weightMatrix[keyLevel].perak;
    } else if (medal === "Perunggu") {
      medalStats[keyLevel].Perunggu += 1;
      totalBobotScore += weightMatrix[keyLevel].perunggu;
    } else {
      medalStats[keyLevel].Partisipasi += 1;
      totalBobotScore += weightMatrix[keyLevel].partisipasi;
    }
  });

  // Indikator 7: Event Olahraga
  const eventRecords = allIndicatorRecords.filter((r) => r.indicatorId === 7);
  const eventPendanaanMap: Record<string, number> = {};
  const eventTingkatMap: Record<string, number> = {};

  eventRecords.forEach((r) => {
    const p = normalizePendanaan(r.sumberPendanaan);
    eventPendanaanMap[p] = (eventPendanaanMap[p] || 0) + 1;
    const t = normalizeLevel(r.tingkatPenyelenggaraan);
    eventTingkatMap[t] = (eventTingkatMap[t] || 0) + 1;
  });

  // Indikator 8: Prestasi Kejuaraan
  const kejuaraanRecords = allIndicatorRecords.filter((r) => r.indicatorId === 8);
  const kejuaraanPendanaanMap: Record<string, number> = {};
  const kejuaraanTingkatMap: Record<string, number> = {};

  kejuaraanRecords.forEach((r) => {
    const p = normalizePendanaan(r.sumberPendanaan);
    kejuaraanPendanaanMap[p] = (kejuaraanPendanaanMap[p] || 0) + 1;
    const t = normalizeLevel(r.tingkatPenyelenggaraan);
    kejuaraanTingkatMap[t] = (kejuaraanTingkatMap[t] || 0) + 1;
  });

  return {
    mutuSDM: {
      totalRecords: mutuRecords.length,
      rawList: attachEvidenceToRecords(mutuRecords),
      jenjangPenugasanStats: Object.entries(mutuJenjangMap).map(([name, value]) => ({ name, value })),
      sumberPendanaanStats: Object.entries(mutuPendanaanMap).map(([name, value]) => ({ name, value })),
    },
    kinerjaSDM: {
      totalRecords: sdmRecords.length,
      rawList: attachEvidenceToRecords(sdmRecords),
      jenjangPenugasanStats: Object.entries(sdmJenjangMap).map(([name, value]) => ({ name, value })),
      sumberPendanaanStats: Object.entries(sdmPendanaanMap).map(([name, value]) => ({ name, value })),
    },
    prestasiAtlet: {
      totalRecords: atletRecords.length,
      rawList: attachEvidenceToRecords(atletRecords),
      medalStats,
      totalBobotScore,
      weightMatrix,
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
      rawList: attachEvidenceToRecords(eventRecords),
      sumberPendanaanStats: Object.entries(eventPendanaanMap).map(([name, value]) => ({ name, value })),
      tingkatKejuaraanStats: Object.entries(eventTingkatMap).map(([name, value]) => ({ name, value })),
    },
    prestasiKejuaraan: {
      totalRecords: kejuaraanRecords.length,
      rawList: attachEvidenceToRecords(kejuaraanRecords),
      sumberPendanaanStats: Object.entries(kejuaraanPendanaanMap).map(([name, value]) => ({ name, value })),
      tingkatKejuaraanStats: Object.entries(kejuaraanTingkatMap).map(([name, value]) => ({ name, value })),
    },
  };
}
