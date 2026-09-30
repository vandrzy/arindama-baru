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
  MapPin,
  Trophy,
  Heart,
  Users,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";

export interface WeightRowState {
  id?: string;
  pilar: "PRESTASI" | "DISABILITAS" | "REKREASI";
  tingkat: "Internasional" | "Nasional" | "Provinsi";
  emas: number;
  perak: number;
  perunggu: number;
  partisipasi: number;
}

const DEFAULT_INITIAL_STATE: WeightRowState[] = [
  // PRESTASI
  { pilar: "PRESTASI", tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { pilar: "PRESTASI", tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { pilar: "PRESTASI", tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
  // DISABILITAS
  { pilar: "DISABILITAS", tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { pilar: "DISABILITAS", tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { pilar: "DISABILITAS", tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
  // REKREASI
  { pilar: "REKREASI", tingkat: "Internasional", emas: 85, perak: 65, perunggu: 45, partisipasi: 25 },
  { pilar: "REKREASI", tingkat: "Nasional", emas: 50, perak: 35, perunggu: 25, partisipasi: 15 },
  { pilar: "REKREASI", tingkat: "Provinsi", emas: 25, perak: 15, perunggu: 10, partisipasi: 5 },
];

const PILAR_CONFIG = {
  PRESTASI: {
    title: "Olahraga Prestasi",
    badge: "Kejuaraan Atlet & Pelajar",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    desc: "Kejuaraan resmi pembinaan prestasi atlet pelajar, mahasiswa, dan kontingen Kaltim.",
    examples: "Contoh: Olimpiade, Asian Games, SEA Games, PON, POPNAS, PORPROV Kaltim, Kejurprov.",
    icon: Trophy,
    color: "emerald",
    activeTabClass: "bg-[#059669] text-white shadow-md shadow-emerald-900/20",
  },
  DISABILITAS: {
    title: "Olahraga Disabilitas",
    badge: "Para Games & Disabilitas",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    desc: "Kejuaraan resmi pembinaan atlet disabilitas dan kejuaraan khusus paralimpik.",
    examples: "Contoh: Paralympics, Asian Para Games, ASEAN Para Games, PEPARNAS, PEPARPROV Kaltim.",
    icon: Heart,
    color: "blue",
    activeTabClass: "bg-blue-600 text-white shadow-md shadow-blue-900/20",
  },
  REKREASI: {
    title: "Masyarakat / Rekreasi",
    badge: "Olahraga Tradisional & Rekreasi",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    desc: "Ajang festival olahraga masyarakat, olahraga tradisional, dan kebugaran rekreasi.",
    examples: "Contoh: TAFISA World Games, FORNAS, FORPROV Kaltim, Festival Olahraga Tradisional.",
    icon: Users,
    color: "amber",
    activeTabClass: "bg-amber-600 text-white shadow-md shadow-amber-900/20",
  },
};

const ROW_METADATA = {
  Internasional: {
    badge: "Bobot Maksimal",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Globe,
    iconBg: "bg-blue-50 text-blue-600",
    subtext: {
      PRESTASI: "Olimpiade, Asian Games, SEA Games, Kejuaraan Dunia Single Cabor",
      DISABILITAS: "Paralympics, Asian Para Games, ASEAN Para Games, Kejuaraan Dunia Para Sports",
      REKREASI: "TAFISA World Games, International Traditional Sports Festival",
    },
  },
  Nasional: {
    badge: "Standar PON",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: Flag,
    iconBg: "bg-emerald-50 text-emerald-700",
    subtext: {
      PRESTASI: "PON, Kejurnas Cabor, POPNAS, Kejuaraan Mahasiswa Nasional",
      DISABILITAS: "PEPARNAS, Kejurnas Para Sports, Kejuaraan Mahasiswa Disabilitas",
      REKREASI: "FORNAS, Festival Olahraga Rekreasi Nasional, Kejurnas Tradisional",
    },
  },
  Provinsi: {
    badge: "Wilayah Kaltim",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    icon: MapPin,
    iconBg: "bg-amber-50 text-amber-700",
    subtext: {
      PRESTASI: "PORPROV Kaltim, Kejurprov, POPDA Kaltim, Kejuaraan Terbuka Provinsi",
      DISABILITAS: "PEPARPROV Kaltim, Kejurprov Disabilitas, Kejuaraan Terbuka Disabilitas Kaltim",
      REKREASI: "FORPROV Kaltim, Festival Olahraga Rekreasi Daerah, Kejurprov Rekreasi",
    },
  },
};

export default function BobotDinamisPage() {
  const { currentUser, isLoading: isSessionLoading } = useApp();

  const [initialWeights, setInitialWeights] = useState<WeightRowState[]>(DEFAULT_INITIAL_STATE);
  const [weights, setWeights] = useState<WeightRowState[]>(DEFAULT_INITIAL_STATE);

  const [activeTab, setActiveTab] = useState<"PRESTASI" | "DISABILITAS" | "REKREASI">("PRESTASI");
  const [showAllMatrices, setShowAllMatrices] = useState<boolean>(false);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch weights from API
  const loadWeights = async () => {
    setIsLoadingData(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/bobot-dinamis");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.weights) && data.weights.length > 0) {
          const formatted: WeightRowState[] = data.weights.map((w: any) => ({
            id: w.id,
            pilar: (w.pilar || "PRESTASI") as WeightRowState["pilar"],
            tingkat: w.tingkat as WeightRowState["tingkat"],
            emas: Number(w.emas) || 0,
            perak: Number(w.perak) || 0,
            perunggu: Number(w.perunggu) || 0,
            partisipasi: Number(w.partisipasi) || 0,
          }));
          setInitialWeights(formatted);
          setWeights(formatted);
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

  // Max points for each pillar (Emas Internasional)
  const maxScores = useMemo(() => {
    const getPilarMax = (pilarKey: "PRESTASI" | "DISABILITAS" | "REKREASI") => {
      const row = weights.find((w) => w.pilar === pilarKey && w.tingkat === "Internasional");
      return row ? row.emas : 100;
    };
    return {
      PRESTASI: getPilarMax("PRESTASI"),
      DISABILITAS: getPilarMax("DISABILITAS"),
      REKREASI: getPilarMax("REKREASI"),
    };
  }, [weights]);

  // Check dirty state
  const isDirty = useMemo(() => {
    if (weights.length !== initialWeights.length) return true;
    for (const w of weights) {
      const init = initialWeights.find((item) => item.pilar === w.pilar && item.tingkat === w.tingkat);
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
    pilar: "PRESTASI" | "DISABILITAS" | "REKREASI",
    tingkat: "Internasional" | "Nasional" | "Provinsi",
    field: "emas" | "perak" | "perunggu" | "partisipasi",
    valStr: string
  ) => {
    const numVal = Math.max(0, parseInt(valStr) || 0);
    setWeights((prev) =>
      prev.map((item) => {
        if (item.pilar === pilar && item.tingkat === tingkat) {
          return { ...item, [field]: numVal };
        }
        return item;
      })
    );
  };

  // Handle Save
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

      const updated: WeightRowState[] = data.weights.map((w: any) => ({
        id: w.id,
        pilar: (w.pilar || "PRESTASI") as WeightRowState["pilar"],
        tingkat: w.tingkat as WeightRowState["tingkat"],
        emas: Number(w.emas) || 0,
        perak: Number(w.perak) || 0,
        perunggu: Number(w.perunggu) || 0,
        partisipasi: Number(w.partisipasi) || 0,
      }));

      setInitialWeights(updated);
      setWeights(updated);
      setNotification("Konfigurasi parameter bobot 3 pilar berhasil diperbarui dan tersimpan!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error("Save weights error:", err);
      setErrorMsg(err.message || "Gagal menyimpan konfigurasi bobot.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reset to Kemenpora standard
  const handleResetKemenpora = async () => {
    if (isResetting) return;
    if (!confirm("Apakah Anda yakin ingin mengembalikan konfigurasi bobot ke Standar Kemenpora?")) return;

    setIsResetting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/bobot-dinamis", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mereset bobot ke Standar Kemenpora.");
      }

      const resetData: WeightRowState[] = data.weights.map((w: any) => ({
        id: w.id,
        pilar: (w.pilar || "PRESTASI") as WeightRowState["pilar"],
        tingkat: w.tingkat as WeightRowState["tingkat"],
        emas: Number(w.emas) || 0,
        perak: Number(w.perak) || 0,
        perunggu: Number(w.perunggu) || 0,
        partisipasi: Number(w.partisipasi) || 0,
      }));

      setInitialWeights(resetData);
      setWeights(resetData);
      setNotification("Konfigurasi bobot berhasil dikembalikan ke Standar Kemenpora!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error("Reset error:", err);
      setErrorMsg(err.message || "Gagal mengembalikan standar bobot.");
    } finally {
      setIsResetting(false);
    }
  };

  if (isSessionLoading || isLoadingData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Memuat konfigurasi matriks bobot dinamis...</p>
      </div>
    );
  }

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
          <Button className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dasbor</span>
          </Button>
        </Link>
      </div>
    );
  }

  const renderMatrixCard = (pilarKey: "PRESTASI" | "DISABILITAS" | "REKREASI") => {
    const config = PILAR_CONFIG[pilarKey];
    const PilarIcon = config.icon;
    const pilarRows = weights.filter((w) => w.pilar === pilarKey);

    return (
      <Card key={pilarKey} className="p-6 sm:p-8 bg-white border border-slate-200/80 shadow-sm rounded-3xl space-y-6">
        {/* Matrix Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`w-10 h-10 rounded-2xl ${config.badgeBg} flex items-center justify-center shrink-0`}>
                <PilarIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{config.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${config.badgeBg}`}>
                {config.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">{config.desc}</p>
          </div>

          <div className="text-xs text-slate-400 max-w-sm italic md:text-right">
            {config.examples}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-4 px-6 w-2/5">TINGKAT PENYELENGGARAAN</th>
                <th className="py-4 px-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                    🥇 MEDALI EMAS
                  </span>
                </th>
                <th className="py-4 px-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60">
                    🥈 MEDALI PERAK
                  </span>
                </th>
                <th className="py-4 px-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/10 text-amber-800 border border-amber-800/20">
                    🥉 MEDALI PERUNGGU
                  </span>
                </th>
                <th className="py-4 px-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                    🏅 PARTISIPASI
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {["Internasional", "Nasional", "Provinsi"].map((tingkatKey) => {
                const row = pilarRows.find((r) => r.tingkat === tingkatKey) || {
                  pilar: pilarKey,
                  tingkat: tingkatKey as any,
                  emas: 0,
                  perak: 0,
                  perunggu: 0,
                  partisipasi: 0,
                };
                const meta = ROW_METADATA[tingkatKey as keyof typeof ROW_METADATA];
                const RowIcon = meta.icon;

                return (
                  <tr key={tingkatKey} className="hover:bg-slate-50/70 transition-colors">
                    {/* Tingkat & Keterangan */}
                    <td className="py-5 px-6">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${meta.iconBg}`}>
                          <RowIcon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-sm">
                              Tingkat {tingkatKey}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${meta.badgeBg}`}>
                              {meta.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {meta.subtext[pilarKey]}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Emas */}
                    <td className="py-5 px-3 text-center align-middle">
                      <input
                        type="number"
                        min={0}
                        value={row.emas}
                        onChange={(e) => handleValueChange(pilarKey, row.tingkat, "emas", e.target.value)}
                        className="w-20 py-2 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      />
                    </td>

                    {/* Perak */}
                    <td className="py-5 px-3 text-center align-middle">
                      <input
                        type="number"
                        min={0}
                        value={row.perak}
                        onChange={(e) => handleValueChange(pilarKey, row.tingkat, "perak", e.target.value)}
                        className="w-20 py-2 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      />
                    </td>

                    {/* Perunggu */}
                    <td className="py-5 px-3 text-center align-middle">
                      <input
                        type="number"
                        min={0}
                        value={row.perunggu}
                        onChange={(e) => handleValueChange(pilarKey, row.tingkat, "perunggu", e.target.value)}
                        className="w-20 py-2 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      />
                    </td>

                    {/* Partisipasi */}
                    <td className="py-5 px-3 text-center align-middle">
                      <input
                        type="number"
                        min={0}
                        value={row.partisipasi}
                        onChange={(e) => handleValueChange(pilarKey, row.tingkat, "partisipasi", e.target.value)}
                        className="w-20 py-2 text-center text-sm font-extrabold rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-elevated flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>ARINDAMA</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 font-bold">Matriks Bobot Dinamis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Matriks Perkalian Bobot (Tingkat Kejuaraan × Capaian)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Dikelompokkan menjadi 3 Pilar: Olahraga Prestasi, Disabilitas, dan Masyarakat/Rekreasi (Dynamic Weighting)
          </p>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={isResetting}
            onClick={handleResetKemenpora}
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm inline-flex items-center gap-2"
          >
            {isResetting ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            ) : (
              <RotateCcw className="w-4 h-4 text-slate-500" />
            )}
            <span>Kembalikan Standar Kemenpora</span>
          </Button>

          <Button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={handleSaveWeights}
            className={`text-xs font-bold px-5 py-2.5 rounded-2xl inline-flex items-center gap-2 transition-all shadow-md ${
              isDirty && !isSaving
                ? "bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-900/20 scale-[1.02]"
                : "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan & Terapkan Bobot</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hero Card: Live Formula & Weighting Engine */}
      <div className="bg-[#0f172a] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col lg:flex-row items-stretch justify-between gap-6 relative overflow-hidden">
        {/* Decorative Background Blur */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-3 max-w-2xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-slate-300 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE FORMULA & WEIGHTING ENGINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Formula Pembobotan Capaian Olahraga Kaltim
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Skor capaian dikalkulasikan secara otomatis berdasarkan tingkatan kejuaraan (Internasional, Nasional, Provinsi) dan perolehan medali (Emas, Perak, Perunggu, Partisipasi) pada 3 kelompok keolahragaan utama.
          </p>
        </div>

        {/* Pillar Max Score Summaries */}
        <div className="flex items-center gap-3 sm:gap-4 self-center lg:self-auto z-10 flex-wrap sm:flex-nowrap">
          {/* PRESTASI */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl min-w-[110px] text-center space-y-0.5">
            <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">PRESTASI</div>
            <div className="text-2xl font-black text-emerald-400">{maxScores.PRESTASI} pt</div>
            <div className="text-[10px] text-slate-400 font-medium">Maks. Emas</div>
          </div>

          {/* DISABILITAS */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl min-w-[110px] text-center space-y-0.5">
            <div className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">DISABILITAS</div>
            <div className="text-2xl font-black text-blue-400">{maxScores.DISABILITAS} pt</div>
            <div className="text-[10px] text-slate-400 font-medium">Maks. Emas</div>
          </div>

          {/* REKREASI */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl min-w-[110px] text-center space-y-0.5">
            <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">REKREASI</div>
            <div className="text-2xl font-black text-amber-400">{maxScores.REKREASI} pt</div>
            <div className="text-[10px] text-slate-400 font-medium">Maks. Emas</div>
          </div>
        </div>
      </div>

      {/* Tabs Control Section (Unified Pill Track Filter) */}
      <div className="bg-[#eaf0f6] p-2 rounded-2xl sm:rounded-full border border-slate-200/50 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {(["PRESTASI", "DISABILITAS", "REKREASI"] as const).map((key) => {
            const cfg = PILAR_CONFIG[key];
            const Icon = cfg.icon;
            const isActive = activeTab === key && !showAllMatrices;

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTab(key);
                  setShowAllMatrices(false);
                }}
                className={`py-3 px-5 rounded-xl sm:rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2.5 ${
                  isActive
                    ? `${cfg.activeTabClass} shadow-sm`
                    : "bg-white text-[#1f2937] hover:bg-white/90 hover:text-slate-900 shadow-2sm"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-700"}`} />
                <span>{cfg.title}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowAllMatrices(!showAllMatrices)}
            className={`py-3 px-5 rounded-xl sm:rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2.5 ${
              showAllMatrices
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-[#1f2937] hover:bg-white/90 hover:text-slate-900 shadow-2sm"
            }`}
          >
            <Layers className={`w-4 h-4 ${showAllMatrices ? "text-white" : "text-slate-700"}`} />
            <span>Tampilkan 3 Matriks</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {showAllMatrices ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {renderMatrixCard("PRESTASI")}
          {renderMatrixCard("DISABILITAS")}
          {renderMatrixCard("REKREASI")}
        </div>
      ) : (
        <div className="animate-in fade-in duration-200">
          {renderMatrixCard(activeTab)}
        </div>
      )}
    </div>
  );
}
