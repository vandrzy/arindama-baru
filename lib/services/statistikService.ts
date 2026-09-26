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
  const [userKota, identityKota] = await Promise.all([
    prisma.user.findMany({
      where: { kabupatenKota: { not: "" } },
      distinct: ["kabupatenKota"],
      select: { kabupatenKota: true },
    }),
    prisma.respondenIdentity.findMany({
      where: { kabupatenKotaAsal: { not: "" } },
      distinct: ["kabupatenKotaAsal"],
      select: { kabupatenKotaAsal: true },
    }),
  ]);

  const uniqueKotaSet = new Set<string>(KABUPATEN_KOTA_OPTIONS);
  userKota.forEach((u) => {
    if (u.kabupatenKota?.trim()) uniqueKotaSet.add(u.kabupatenKota.trim());
  });
  identityKota.forEach((i) => {
    if (i.kabupatenKotaAsal?.trim()) uniqueKotaSet.add(i.kabupatenKotaAsal.trim());
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

  // Filtered Responden list
  const respondenUsers = await prisma.user.findMany({
    where: {
      role: "RESPONDEN",
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

  const listResponden = respondenUsers.map((u) => ({
    id: u.id,
    nama: u.nama,
    email: u.email,
    kabupatenKota: u.kabupatenKota || "Samarinda",
    instansi: u.instansi || "DISPORA",
  }));

  return {
    listKota,
    listInstansi,
    listResponden,
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
  // 1. Build Submission filter condition
  const submissionWhere: any = {};

  if (currentUser.role === "RESPONDEN") {
    submissionWhere.userId = currentUser.id;
  } else if (currentUser.role === "ADMIN") {
    if (paramUserId) {
      submissionWhere.userId = paramUserId;
    } else {
      const userWhere: any = {};
      if (paramKota) userWhere.kabupatenKota = paramKota;
      if (paramInstansi) userWhere.instansi = paramInstansi;
      if (Object.keys(userWhere).length > 0) {
        submissionWhere.user = userWhere;
      }
    }
  }

  // Fetch submissions with select
  const matchingSubmissions = await prisma.submission.findMany({
    where: submissionWhere,
    select: {
      id: true,
      respondenIdentity: true,
      indicatorRecords: true,
      validationEvidences: true,
    },
  });

  // Build O(1) Evidence Lookup Map with comprehensive alias keys
  const evidenceMap = new Map<string, any>();
  matchingSubmissions.forEach((s) => {
    s.validationEvidences.forEach((ev) => {
      if (ev.recordId) {
        evidenceMap.set(`${s.id}:${ev.recordId}`, ev);
        if (ev.formType) {
          evidenceMap.set(`${s.id}:${ev.formType}:${ev.recordId}`, ev);
        }
      }
      if (ev.formType) {
        evidenceMap.set(`${s.id}:${ev.formType}`, ev);
        
        // Alias mappings for formType
        if (ev.formType === "0" || ev.formType === "identitas") {
          evidenceMap.set(`${s.id}:0`, ev);
          evidenceMap.set(`${s.id}:identitas`, ev);
        }

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

  const getEvidenceForIdentity = (submissionId: string, id: string) => {
    return (
      evidenceMap.get(`${submissionId}:${id}`) ||
      evidenceMap.get(`${submissionId}:0`) ||
      evidenceMap.get(`${submissionId}:identitas`) ||
      evidenceMap.get(`${submissionId}:row_0`) ||
      null
    );
  };

  const getEvidenceForRecord = (
    submissionId: string,
    recordId: string,
    indicatorId: number,
    rowIndex: number
  ) => {
    const indStr = String(indicatorId);
    const indAlias = `indikator_${indicatorId}`;
    const rowKey = `row_${rowIndex}`;

    return (
      evidenceMap.get(`${submissionId}:${recordId}`) ||
      evidenceMap.get(`${submissionId}:${indStr}:${rowKey}`) ||
      evidenceMap.get(`${submissionId}:${indAlias}:${rowKey}`) ||
      evidenceMap.get(`${submissionId}:${indStr}:${recordId}`) ||
      evidenceMap.get(`${submissionId}:${indAlias}:${recordId}`) ||
      evidenceMap.get(`${submissionId}:${rowKey}`) ||
      evidenceMap.get(`${submissionId}:${indStr}`) ||
      evidenceMap.get(`${submissionId}:${indAlias}`) ||
      null
    );
  };

  // A. Demografi
  const identitiesRaw = matchingSubmissions
    .map((s) => s.respondenIdentity)
    .filter((id): id is NonNullable<typeof id> => Boolean(id));

  const identities = identitiesRaw.map((id) => ({
    ...id,
    validationEvidence: getEvidenceForIdentity(id.submissionId, id.id),
  }));

  const totalResponden = identities.length;

  const jenisKelaminStats = [
    { name: "Laki-laki", value: 0 },
    { name: "Perempuan", value: 0 },
  ];
  const umurStats: Record<string, number> = {
    "< 20 Tahun": 0,
    "20 - 30 Tahun": 0,
    "31 - 40 Tahun": 0,
    "41 - 50 Tahun": 0,
    "> 50 Tahun": 0,
  };
  const pekerjaanMap: Record<string, number> = {};
  const kotaMap: Record<string, number> = {};

  identities.forEach((id) => {
    const jk = (id.jenisKelamin || "").toLowerCase();
    if (jk.includes("perempuan") || jk.includes("wanita") || jk === "p") {
      jenisKelaminStats[1].value += 1;
    } else {
      jenisKelaminStats[0].value += 1;
    }

    const u = parseInt(id.umur) || 0;
    if (u > 0) {
      if (u < 20) umurStats["< 20 Tahun"] += 1;
      else if (u <= 30) umurStats["20 - 30 Tahun"] += 1;
      else if (u <= 40) umurStats["31 - 40 Tahun"] += 1;
      else if (u <= 50) umurStats["41 - 50 Tahun"] += 1;
      else umurStats["> 50 Tahun"] += 1;
    }

    const pk = id.pekerjaanJabatan || "Tidak Diisi";
    pekerjaanMap[pk] = (pekerjaanMap[pk] || 0) + 1;

    const kt = id.kabupatenKotaAsal || "Tidak Diisi";
    kotaMap[kt] = (kotaMap[kt] || 0) + 1;
  });

  // B. Indicators Processing
  const allIndicatorRecords = matchingSubmissions.flatMap((s) => s.indicatorRecords);

  // Index row positions per submission and indicatorId
  const submissionIndicatorRowMap = new Map<string, number>();

  const attachEvidenceToRecords = (records: any[]) => {
    return records.map((r) => {
      const key = `${r.submissionId}:${r.indicatorId}`;
      const rowIndex = submissionIndicatorRowMap.get(key) || 0;
      submissionIndicatorRowMap.set(key, rowIndex + 1);

      return {
        ...r,
        validationEvidence: getEvidenceForRecord(
          r.submissionId,
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
    demografi: {
      totalResponden,
      identitiesList: identities,
      rawList: identities,
      jenisKelaminStats,
      umurStats: Object.entries(umurStats).map(([name, value]) => ({ name, value })),
      pekerjaanStats: Object.entries(pekerjaanMap).map(([name, value]) => ({ name, value })),
      kotaStats: Object.entries(kotaMap).map(([name, value]) => ({ name, value })),
    },
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
