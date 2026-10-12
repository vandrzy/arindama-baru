"use client";

import React from "react";
import { CalendarClock, Clock, AlertCircle } from "lucide-react";
import { useCutoffStatus } from "@/lib/hooks/useCutoffStatus";

export function CutoffBannerOperator() {
  const { config, isLocked, loading } = useCutoffStatus();

  if (loading) {
    return (
      <div className="w-full p-5 bg-[#ecfbf2]/60 border border-[#a7f3d0] rounded-2xl sm:rounded-3xl animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-200/50 rounded-xl sm:rounded-2xl shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-48 bg-emerald-200/50 rounded" />
            <div className="h-5 w-72 bg-emerald-200/50 rounded" />
            <div className="h-3 w-80 bg-emerald-200/50 rounded" />
          </div>
        </div>
        <div className="h-8 w-28 bg-emerald-200/50 rounded-full hidden sm:block" />
      </div>
    );
  }

  const cutoffDate = config?.cutoffDate || "2026-12-31";

  // Hitung sisa hari
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cutoff = new Date(cutoffDate);
  cutoff.setHours(23, 59, 59, 999);

  const diffMs = cutoff.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Format tanggal dalam bahasa Indonesia (WITA)
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dateObj = new Date(cutoffDate);
  const formattedDate = !isNaN(dateObj.getTime())
    ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} (Pukul 23:59:59 WITA)`
    : "31 Desember 2026 (Pukul 23:59:59 WITA)";

  const isClosed = isLocked || daysRemaining === 0;

  return (
    <div className="w-full bg-[#ecfbf2] border border-[#a7f3d0] rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:px-6 lg:py-5 shadow-2xs transition-all hover:border-[#86efac]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* SISI KIRI: ICON KOTAK HIJAU & INFORMASI TANGGAL */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#038e5e] flex items-center justify-center shrink-0 shadow-xs">
            <CalendarClock className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>

          <div className="space-y-1">
            <span className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#065f46]">
              BATAS WAKTU PENGISIAN DATA CAPAIAN (CUT-OFF DATE)
            </span>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                Batas Akhir Input Dokumen:
              </span>
              <span className="inline-flex items-center px-3 py-0.5 sm:py-1 bg-white border border-[#a7f3d0] rounded-lg text-xs sm:text-sm font-bold text-slate-800 shadow-2xs font-mono">
                {formattedDate}
              </span>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5">
              Pastikan seluruh data capaian dan berkas bukti fisik telah diunggah sebelum batas waktu berakhir.
            </p>
          </div>
        </div>

        {/* SISI KANAN: SISA WAKTU PENGISIAN */}
        <div className="flex flex-col items-start md:items-end gap-1 shrink-0 pl-14 sm:pl-16 md:pl-0">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            SISA WAKTU PENGISIAN
          </span>

          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 bg-white border rounded-full text-xs sm:text-sm font-bold shadow-2xs ${
              isClosed
                ? "border-rose-300 text-rose-700"
                : daysRemaining <= 7
                ? "border-amber-300 text-amber-700"
                : "border-[#a7f3d0] text-[#038e5e]"
            }`}
          >
            {isClosed ? (
              <>
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Akses Ditutup</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-[#038e5e]" />
                <span>{daysRemaining} Hari Tersisa</span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
