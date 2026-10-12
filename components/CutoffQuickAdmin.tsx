"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Pencil,
  Save,
  Unlock,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface CutoffConfigData {
  enabled: boolean;
  title: string;
  startDate: string;
  cutoffDate: string;
  kebijakanAkses: "OTOMATIS" | "KUNCI_MANUAL";
  message: string;
}

export function CutoffQuickAdmin() {
  // State data konfigurasi
  const [config, setConfig] = useState<CutoffConfigData>({
    enabled: true,
    title: "Evaluasi Capaian Keolahragaan Provinsi Kalimantan Timur 2026",
    startDate: "2026-01-01",
    cutoffDate: "2026-12-01",
    kebijakanAkses: "OTOMATIS",
    message: "Maaf, periode pengisian dan pengunggahan data survei telah ditutup."
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State untuk Quick Edit
  const [formDate, setFormDate] = useState("");
  const [formKebijakan, setFormKebijakan] = useState<"OTOMATIS" | "KUNCI_MANUAL">("OTOMATIS");

  // Notifikasi Feedback Singkat
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Fetch Konfigurasi Awal dari Database API
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config/cutoff", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.config) {
        setConfig(json.config);
        setFormDate(json.config.cutoffDate || "2026-12-01");
        setFormKebijakan(json.config.kebijakanAkses || "OTOMATIS");
      }
    } catch (err) {
      console.error("Gagal memuat batas waktu cutoff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    const handleExternalUpdate = () => {
      fetchConfig();
    };

    window.addEventListener("cutoffConfigUpdated", handleExternalUpdate);
    return () => {
      window.removeEventListener("cutoffConfigUpdated", handleExternalUpdate);
    };
  }, []);

  // Buka mode edit dan set nilai awal form
  const handleStartEdit = () => {
    setFormDate(config.cutoffDate);
    setFormKebijakan(config.kebijakanAkses);
    setFeedback(null);
    setIsEditing(true);
  };

  // Batalkan mode edit
  const handleCancelEdit = () => {
    setFormDate(config.cutoffDate);
    setFormKebijakan(config.kebijakanAkses);
    setIsEditing(false);
  };

  // 2. Simpan Perubahan ke Database API
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formDate) {
      setFeedback({ type: "error", message: "Tanggal tidak boleh kosong." });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const res = await fetch("/api/config/cutoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cutoffDate: formDate,
          kebijakanAkses: formKebijakan,
          enabled: true
        })
      });

      const result = await res.json();

      if (result.success && result.config) {
        setConfig(result.config);
        setIsEditing(false);
        setFeedback({ type: "success", message: "Batas waktu berhasil diperbarui!" });
        
        // Dispatch event agar komponen lain mengetahui adanya update
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cutoffConfigUpdated"));
        }

        setTimeout(() => setFeedback(null), 3500);
      } else {
        setFeedback({ type: "error", message: result.error || "Gagal memperbarui batas waktu." });
      }
    } catch (err) {
      console.error("Error saving quick cutoff:", err);
      setFeedback({ type: "error", message: "Terjadi kesalahan koneksi sistem." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status terkunci: Kunci manual atau tanggal cutoff sudah lewat
  const isCutoffPassed = new Date(config.cutoffDate).setHours(23, 59, 59, 999) < Date.now();
  const isLocked = config.kebijakanAkses === "KUNCI_MANUAL" || isCutoffPassed;

  if (loading) {
    return (
      <div className="w-full p-4 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-slate-100 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-64 bg-slate-100 rounded" />
            <div className="h-3 w-80 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-36 bg-slate-100 rounded-xl" />
          <div className="h-9 w-28 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* SISI KIRI: ICON, JUDUL, BADGE STATUS, & SUBTITLE */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border ${
              isLocked
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-[#dcfce7] border-[#86efac] text-[#065f46]"
            }`}
          >
            {isLocked ? (
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
            ) : (
              <Unlock className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Periode Evaluasi &amp; Batas Waktu Pengisian (Cut-Off Date)
              </span>
              
              {isLocked ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
                  Akses Terkunci
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  Pengisian Aktif Terbuka
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Batas akhir input data capaian &amp; bukti fisik untuk 10 Kabupaten/Kota se-Kaltim:{" "}
              <strong className="text-slate-900 font-bold font-mono">
                {config.cutoffDate || "2026-12-01"}
              </strong>
            </p>
          </div>
        </div>

        {/* SISI KANAN: DUA KONDISI TAMPILAN (DEFAULT VS QUICK EDIT) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start lg:self-center pl-14 sm:pl-16 lg:pl-0">
          
          {!isEditing ? (
            /* --- KONDISI 1: TOMBOL NORMAL (GAMBAR 1) --- */
            <>
              {feedback && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg mr-1 ${
                    feedback.type === "success"
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      : "text-rose-700 bg-rose-50 border border-rose-200"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {feedback.message}
                </span>
              )}

              <Link
                href="/dashboard/batas-waktu"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#ecfdf5] hover:bg-emerald-100/80 text-[#065f46] border border-[#a7f3d0] transition-colors shadow-2xs"
              >
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Halaman Pengaturan &raquo;</span>
              </Link>

              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                <Pencil className="w-4 h-4 text-slate-600" />
                <span>Ubah Cepat</span>
              </button>
            </>
          ) : (
            /* --- KONDISI 2: FORMULIR INLINE UBAH CEPAT (GAMBAR 2) --- */
            <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2">
              {/* Input Tanggal */}
              <div className="relative">
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                  required
                />
              </div>

              {/* Dropdown Buka / Kunci Form */}
              <div className="relative">
                <select
                  value={formKebijakan}
                  onChange={(e) => setFormKebijakan(e.target.value as "OTOMATIS" | "KUNCI_MANUAL")}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer"
                >
                  <option value="OTOMATIS">Buka Form</option>
                  <option value="KUNCI_MANUAL">Kunci Form</option>
                </select>
              </div>

              {/* Tombol Simpan */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#038e5e] hover:bg-[#02704a] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span>Simpan</span>
              </button>

              {/* Tombol Batal */}
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="px-2 py-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
