"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import {
  Globe,
  Flag,
  Landmark,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

interface WeightRowState {
  id?: string;
  tingkat: "Internasional" | "Nasional" | "Provinsi";
  emas: number;
  perak: number;
  perunggu: number;
  partisipasi: number;
}

const DEFAULT_INITIAL_STATE: WeightRowState[] = [
  { tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
];

export default function BobotDinamisPage() {
  const { currentUser, isLoading: isSessionLoading } = useApp();

  // Initial fetched data from DB
  const [initialWeights, setInitialWeights] = useState<WeightRowState[]>(DEFAULT_INITIAL_STATE);
  // Current edited values
  const [weights, setWeights] = useState<WeightRowState[]>(DEFAULT_INITIAL_STATE);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch weights from backend API
  const loadWeights = async () => {
    setIsLoadingData(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/bobot-dinamis");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.weights) && data.weights.length > 0) {
          const sorted = data.weights.map((w: any) => ({
            id: w.id,
            tingkat: w.tingkat,
            emas: Number(w.emas) || 0,
            perak: Number(w.perak) || 0,
            perunggu: Number(w.perunggu) || 0,
            partisipasi: Number(w.partisipasi) || 0,
          }));
          setInitialWeights(sorted);
          setWeights(sorted);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || "Gagal memuat data bobot dinamis.");
      }
    } catch (err: any) {
      console.error("Gagal mengambil data bobot:", err);
      setErrorMsg("Terjadi kesalahan koneksi saat memuat data bobot.");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      loadWeights();
    } else {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  // Check if current input values differ from initial DB values (isDirty flag)
  const isDirty = useMemo(() => {
    if (weights.length !== initialWeights.length) return true;
    for (let i = 0; i < weights.length; i++) {
      const w = weights[i];
      const init = initialWeights.find((item) => item.tingkat === w.tingkat);
      if (!init) return true;
      if (
        Number(w.emas) !== Number(init.emas) ||
        Number(w.perak) !== Number(init.perak) ||
        Number(w.perunggu) !== Number(init.perunggu) ||
        Number(w.partisipasi) !== Number(init.partisipasi)
      ) {
        return true;
      }
    }
    return false;
  }, [weights, initialWeights]);

  // Handle number input changes
  const handleValueChange = (
    tingkat: "Internasional" | "Nasional" | "Provinsi",
    field: "emas" | "perak" | "perunggu" | "partisipasi",
    value: string
  ) => {
    const numVal = Math.max(0, parseInt(value) || 0);
    setWeights((prev) =>
      prev.map((item) => {
        if (item.tingkat === tingkat) {
          return { ...item, [field]: numVal };
        }
        return item;
      })
    );
  };

  // Handle Form Submit / Save
  const handleSaveWeights = async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/bobot-dinamis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan konfigurasi bobot.");
      }

      const updated = data.weights.map((w: any) => ({
        id: w.id,
        tingkat: w.tingkat,
        emas: Number(w.emas) || 0,
        perak: Number(w.perak) || 0,
        perunggu: Number(w.perunggu) || 0,
        partisipasi: Number(w.partisipasi) || 0,
      }));

      setInitialWeights(updated);
      setWeights(updated);
      setNotification("Konfigurasi parameter bobot berhasil diperbarui dan tersimpan ke basis data.");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error("Save weights error:", err);
      setErrorMsg(err.message || "Gagal menyimpan konfigurasi bobot.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to initial fetched DB state
  const handleReset = () => {
    setWeights(initialWeights);
  };

  if (isSessionLoading || isLoadingData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Memuat konfigurasi bobot dinamis...</p>
      </div>
    );
  }

  // Access Denied for Non-Admin
  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="py-20 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Akses Terbatas (Admin Only)</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Halaman konfigurasi bobot dinamis hanya diperuntukkan bagi Administrator Dispora.
        </p>
        <Link href="/dashboard">
          <Button className="bg-[#04331d] hover:bg-[#07482b] text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-elevated flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Matriks Perkalian Bobot Card */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-sm rounded-3xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Matriks Perkalian Bobot (Tingkat Kejuaraan × Capaian)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 pl-11">
              Ubah nilai angka pada kolom tabel untuk menyesuaikan bobot instrumen penilaian
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mode Edit Parameter Aktif</span>
            </span>

            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                title="Batalkan perubahan"
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dynamic Weight Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-4 px-6">TINGKAT PENYELENGGARAAN</th>
                <th className="py-4 px-4 text-center">MEDALI EMAS (POIN)</th>
                <th className="py-4 px-4 text-center">MEDALI PERAK (POIN)</th>
                <th className="py-4 px-4 text-center">MEDALI PERUNGGU (POIN)</th>
                <th className="py-4 px-4 text-center">PARTISIPASI / LISENSI (POIN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {weights.map((row) => {
                const isInter = row.tingkat === "Internasional";
                const isNas = row.tingkat === "Nasional";
                const Icon = isInter ? Globe : isNas ? Flag : Landmark;
                const iconColor = isInter ? "text-blue-600 bg-blue-50" : isNas ? "text-amber-600 bg-amber-50" : "text-emerald-700 bg-emerald-50";

                return (
                  <tr key={row.tingkat} className="hover:bg-slate-50/60 transition-colors">
                    {/* Column 1: Tingkat Penyelenggaraan (Hapus Badge & Subtitle) */}
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">
                            Tingkat {row.tingkat === "Provinsi" ? "Provinsi / Daerah" : row.tingkat}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Medali Emas (Poin) */}
                    <td className="py-5 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.emas}
                        onChange={(e) => handleValueChange(row.tingkat, "emas", e.target.value)}
                        className="w-24 py-2 px-3 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all shadow-sm"
                      />
                    </td>

                    {/* Column 3: Medali Perak (Poin) */}
                    <td className="py-5 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.perak}
                        onChange={(e) => handleValueChange(row.tingkat, "perak", e.target.value)}
                        className="w-24 py-2 px-3 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all shadow-sm"
                      />
                    </td>

                    {/* Column 4: Medali Perunggu (Poin) */}
                    <td className="py-5 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.perunggu}
                        onChange={(e) => handleValueChange(row.tingkat, "perunggu", e.target.value)}
                        className="w-24 py-2 px-3 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all shadow-sm"
                      />
                    </td>

                    {/* Column 5: Partisipasi / Lisensi (Poin) */}
                    <td className="py-5 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.partisipasi}
                        onChange={(e) => handleValueChange(row.tingkat, "partisipasi", e.target.value)}
                        className="w-24 py-2 px-3 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 focus:bg-white transition-all shadow-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium italic">
            * Perubahan parameter bobot tersimpan langsung pada basis data sistem dan berlaku di seluruh portal verifikasi.
          </p>

          <Button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={handleSaveWeights}
            className={`font-extrabold text-xs px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md ${
              isDirty && !isSaving
                ? "bg-[#04331d] hover:bg-[#07482b] text-white shadow-emerald-950/20 scale-[1.02]"
                : "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Konfigurasi Bobot</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
