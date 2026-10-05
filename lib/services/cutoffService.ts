import { prisma } from "@/lib/prisma";

export interface CutoffConfig {
  enabled: boolean;
  title: string;
  startDate: string;
  cutoffDate: string;
  kebijakanAkses: "OTOMATIS" | "KUNCI_MANUAL";
  message: string;
}

export const DEFAULT_CUTOFF_CONFIG: CutoffConfig = {
  enabled: true,
  title: "Evaluasi Capaian Keolahragaan Provinsi Kalimantan Timur 2026",
  startDate: "2026-01-01",
  cutoffDate: "2026-12-31",
  kebijakanAkses: "OTOMATIS",
  message: "Maaf, periode pengisian dan pengunggahan data survei telah ditutup.",
};

const SYSTEM_CONFIG_KEY = "SUBMISSION_CUTOFF";

/**
 * Ambil konfigurasi batas waktu saat ini
 */
export async function getCutoffConfig(): Promise<CutoffConfig> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: SYSTEM_CONFIG_KEY },
    });

    if (!config || !config.value) {
      return DEFAULT_CUTOFF_CONFIG;
    }

    const parsed = JSON.parse(config.value);
    return {
      ...DEFAULT_CUTOFF_CONFIG,
      ...parsed,
    };
  } catch (error) {
    console.error("Error fetching cutoff config:", error);
    return DEFAULT_CUTOFF_CONFIG;
  }
}

/**
 * Simpan/Update konfigurasi batas waktu & catat log perubahan
 */
export async function updateCutoffConfig(
  newConfig: Partial<CutoffConfig>,
  adminId: string,
  adminNama?: string
): Promise<CutoffConfig> {
  const currentConfig = await getCutoffConfig();

  const mergedConfig: CutoffConfig = {
    ...currentConfig,
    ...newConfig,
  };

  const jsonValue = JSON.stringify(mergedConfig);

  // Upsert SystemConfig
  await prisma.systemConfig.upsert({
    where: { key: SYSTEM_CONFIG_KEY },
    update: {
      value: jsonValue,
      updatedBy: adminNama || adminId,
    },
    create: {
      key: SYSTEM_CONFIG_KEY,
      value: jsonValue,
      updatedBy: adminNama || adminId,
    },
  });

  // Catat Log ke CutoffLog
  const isEnabled = mergedConfig.enabled && mergedConfig.kebijakanAkses === "OTOMATIS";
  const cutoffDateObj = mergedConfig.cutoffDate ? new Date(mergedConfig.cutoffDate) : null;
  const actionNote = `Mengubah judul: "${mergedConfig.title}", Periode: ${mergedConfig.startDate} s/d ${mergedConfig.cutoffDate} (${
    mergedConfig.kebijakanAkses === "KUNCI_MANUAL" ? "Kunci Manual" : "Terbuka Otomatis"
  })`;

  await prisma.cutoffLog.create({
    data: {
      adminId: adminId || "ADMIN_SYSTEM",
      adminNama: adminNama || "Admin Dispora",
      statusBatasWaktu: isEnabled,
      perubahanBatasWaktu: cutoffDateObj,
      actionNote: actionNote,
    },
  });

  // Catat AuditLog "Ubah Batas Waktu"
  if (adminId && adminId !== "ADMIN_SYSTEM") {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "Ubah Batas Waktu",
        entity: "SystemConfig",
        details: { title: mergedConfig.title, startDate: mergedConfig.startDate, cutoffDate: mergedConfig.cutoffDate, kebijakanAkses: mergedConfig.kebijakanAkses },
      },
    });
  }

  return mergedConfig;
}

/**
 * Mengambil daftar riwayat log perubahan batas waktu (terbaru dulu)
 */
export async function getCutoffLogs(limit: number = 20) {
  try {
    const logs = await prisma.cutoffLog.findMany({
      orderBy: { tanggal: "desc" },
      take: limit,
    });
    return logs;
  } catch (error) {
    console.error("Error fetching cutoff logs:", error);
    return [];
  }
}

/**
 * Cek apakah saat ini pengisian data terkunci
 */
export async function checkIsCutoffLocked(): Promise<{ isLocked: boolean; message: string }> {
  const config = await getCutoffConfig();

  if (!config.enabled || config.kebijakanAkses === "KUNCI_MANUAL") {
    return { isLocked: true, message: config.message };
  }

  const now = new Date();
  const cutoff = new Date(config.cutoffDate);
  cutoff.setHours(23, 59, 59, 999);

  if (now > cutoff) {
    return { isLocked: true, message: config.message };
  }

  return { isLocked: false, message: "" };
}
