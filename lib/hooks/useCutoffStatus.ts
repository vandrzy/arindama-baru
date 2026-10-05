"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/lib/context/app-context";

export interface CutoffConfig {
  id?: string;
  namaPeriode?: string;
  tanggalMulai?: string;
  cutoffDate: string;
  enabled: boolean;
  kebijakanAkses: "OTOMATIS" | "KUNCI_MANUAL";
  message?: string;
}

export function useCutoffStatus() {
  const { currentUser } = useApp();
  const [config, setConfig] = useState<CutoffConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCutoff = async () => {
    try {
      const res = await fetch("/api/config/cutoff");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil status batas waktu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCutoff();
  }, []);

  const isLocked = useMemo(() => {
    // Admin is never locked by cutoff rule in UI
    if (currentUser?.role === "ADMIN") return false;

    if (!config || !config.enabled) return false;
    if (config.kebijakanAkses === "KUNCI_MANUAL") return true;

    if (!config.cutoffDate) return false;

    const now = new Date();
    const cutoffDate = new Date(config.cutoffDate);
    cutoffDate.setHours(23, 59, 59, 999);

    return now > cutoffDate;
  }, [config, currentUser?.role]);

  return {
    isLocked,
    message:
      config?.message ||
      "Batas waktu pengisian telah lewat. Anda tidak dapat lagi menambahkan atau mengubah data.",
    config,
    loading,
    refetch: fetchCutoff,
  };
}
