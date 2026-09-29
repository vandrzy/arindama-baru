"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Throbber from "@/components/ui/throbber";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Users,
  Award,
  Calendar,
  Trophy,
  Filter,
  MapPin,
  Building2,
  UserCheck,
  ChevronDown,
  Info,
  Sparkles,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Medal,
  GraduationCap,
  FileText,
  ExternalLink,
  Search,
  X,
} from "lucide-react";
import { KABUPATEN_KOTA_OPTIONS, INSTANSI_OPTIONS } from "@/lib/constants/survey-data";

const MutuSDMSection = dynamic(() => import("@/components/statistik/MutuSDMSection"), {
  loading: () => <Throbber message="Memuat statistik mutu SDM..." />,
});
const KinerjaSDMSection = dynamic(() => import("@/components/statistik/KinerjaSDMSection"), {
  loading: () => <Throbber message="Memuat statistik kinerja SDM..." />,
});
const PrestasiAtletSection = dynamic(() => import("@/components/statistik/PrestasiAtletSection"), {
  loading: () => <Throbber message="Memuat statistik prestasi atlet..." />,
});
const EventOlahragaSection = dynamic(() => import("@/components/statistik/EventOlahragaSection"), {
  loading: () => <Throbber message="Memuat statistik event olahraga..." />,
});
const PrestasiKejuaraanSection = dynamic(() => import("@/components/statistik/PrestasiKejuaraanSection"), {
  loading: () => <Throbber message="Memuat statistik prestasi kejuaraan..." />,
});

// Vibrant, cohesive color palettes
const COLOR_PALETTE = [
  "#0F766E", // Teal 700
  "#0284C7", // Sky 600
  "#F59E0B", // Amber 500
  "#8B5CF6", // Purple 500
  "#EF4444", // Red 500
  "#10B981", // Emerald 500
  "#EC4899", // Pink 500
  "#6366F1", // Indigo 500
];

const MEDAL_COLORS = {
  Emas: "#F59E0B", // Gold
  Perak: "#94A3B8", // Silver
  Perunggu: "#D97706", // Bronze
};

type CategoryKey =
  | "mutuSDM"
  | "kinerjaSDM"
  | "prestasiAtlet"
  | "eventOlahraga"
  | "prestasiKejuaraan";

const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    key: "mutuSDM",
    label: "1. Peningkatan Mutu SDM",
    shortLabel: "Mutu SDM",
    icon: GraduationCap,
    description: "Evaluasi pelatihan dan penataran SDM Olahraga (Wasit, Pelatih, Juri, dll) serta perbandingan sumber pendanaan.",
  },
  {
    key: "kinerjaSDM",
    label: "2. Kinerja SDM",
    shortLabel: "Kinerja SDM",
    icon: TrendingUp,
    description: "Evaluasi jenjang penugasan Wasit, Pelatih, Juri pada kejuaraan serta perbandingan sumber pendanaan operasional.",
  },
  {
    key: "prestasiAtlet",
    label: "3. Prestasi Atlet",
    shortLabel: "Prestasi Atlet",
    icon: Medal,
    description: "Visualisasi perolehan medali (Provinsi, Nasional, Internasional) dan hasil kalkulasi bobot poin capaian.",
  },
  {
    key: "eventOlahraga",
    label: "4. Statistik Penyelenggara Event Olahraga",
    shortLabel: "Penyelenggara Event",
    icon: Calendar,
    description: "Sebaran tingkat penyelenggaraan event keolahragaan dan analisis asal sumber pendanaan kegiatan.",
  },
  {
    key: "prestasiKejuaraan",
    label: "5. Prestasi Kejuaraan",
    shortLabel: "Prestasi Kejuaraan",
    icon: Trophy,
    description: "Distribusi partisipasi dan capaian kejuaraan beserta struktur pendanaan pendukung.",
  },
];

export default function StatistikPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("mutuSDM");
  const [selectedKinerjaIndicator, setSelectedKinerjaIndicator] = useState<string>("all");
  const [selectedAtletIndicator, setSelectedAtletIndicator] = useState<string>("all");

  // State untuk Pagination & Search Tabel
  const [currentPage, setCurrentPage] = useState(1);
  const [tableSearchQuery, setTableSearchQuery] = useState<string>("");
  const itemsPerPage = 10;

  // Reset pagination ke halaman pertama dan clear search jika kategori atau filter indicator berubah
  useEffect(() => {
    setCurrentPage(1);
    setTableSearchQuery("");
  }, [selectedCategory, selectedKinerjaIndicator, selectedAtletIndicator]);

  // Auth & API data state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statistikData, setStatistikData] = useState<any>(null);
  const [adminFiltersData, setAdminFiltersData] = useState<any>(null);

  // Admin UI state filters
  const [selectedKota, setSelectedKota] = useState<string>("");
  const [selectedInstansi, setSelectedInstansi] = useState<string>("");
  const [selectedRespondenId, setSelectedRespondenId] = useState<string>("");
  const [adminFilterMessage, setAdminFilterMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchStatistik();
  }, []);

  const fetchStatistik = async (
    kota = selectedKota,
    instansi = selectedInstansi,
    respId = selectedRespondenId
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (kota) params.append("kota", kota);
      if (instansi) params.append("instansi", instansi);
      if (respId) params.append("userId", respId);

      const res = await fetch(`/api/statistik?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Gagal mengambil data statistik");
      }
      const json = await res.json();
      if (json.success) {
        setCurrentUser(json.currentUser);
        setStatistikData(json.data);
        setAdminFiltersData(json.adminFiltersData);
      }
    } catch (err) {
      console.error("Fetch statistik error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdminFilter = () => {
    fetchStatistik(selectedKota, selectedInstansi, selectedRespondenId);
    setAdminFilterMessage(
      `Filter Admin Berhasil Diterapkan: Kota "${selectedKota || "Semua"}", Instansi "${selectedInstansi || "Semua"}", dan Responden "${selectedRespondenId ? "ID " + selectedRespondenId : "Semua"}"`
    );
    setTimeout(() => setAdminFilterMessage(null), 5000);
  };

  const handleResetAdminFilter = () => {
    setSelectedKota("");
    setSelectedInstansi("");
    setSelectedRespondenId("");
    fetchStatistik("", "", "");
    setAdminFilterMessage("Filter Admin berhasil direset ke tampilan default (Seluruh Data).");
    setTimeout(() => setAdminFilterMessage(null), 4000);
  };

  // Data helpers for calculations and hooks
  const demografiData = statistikData?.demografi || {};
  const mutuData = statistikData?.mutuSDM || {};
  const kinerjaData = statistikData?.kinerjaSDM || {};
  const atletData = statistikData?.prestasiAtlet || {};
  const eventData = statistikData?.eventOlahraga || {};
  const kejuaraanData = statistikData?.prestasiKejuaraan || {};

  const rawKinerjaList: any[] = kinerjaData.rawList || [];

  const filteredKinerjaList = useMemo(() => {
    if (selectedKinerjaIndicator === "all") return rawKinerjaList;
    const targetId = parseInt(selectedKinerjaIndicator);
    return rawKinerjaList.filter((r) => r.indicatorId === targetId);
  }, [rawKinerjaList, selectedKinerjaIndicator]);

  const activeKinerjaJenjangStats = useMemo(() => {
    let sdmJenjangMap: Record<string, number> = {
      Provinsi: 0,
      Nasional: 0,
      Internasional: 0,
    };
    filteredKinerjaList.forEach((r) => {
      const val = r.tingkatPenyelenggaraan || "";
      const s = val.toLowerCase();
      let level = "Provinsi";
      if (s.includes("internasional")) level = "Internasional";
      else if (s.includes("nasional")) level = "Nasional";
      else if (s.includes("provinsi")) level = "Provinsi";

      if (level in sdmJenjangMap) {
        sdmJenjangMap[level] += 1;
      } else {
        sdmJenjangMap["Provinsi"] += 1;
      }
    });
    return Object.entries(sdmJenjangMap).map(([name, value]) => ({ name, value }));
  }, [filteredKinerjaList]);

  const activeKinerjaPendanaanStats = useMemo(() => {
    let sdmPendanaanMap: Record<string, number> = {};
    filteredKinerjaList.forEach((r) => {
      const val = r.sumberPendanaan || "";
      const s = val.toLowerCase();
      let pendanaan = val.trim() || "Mandiri / Lainnya";
      if (s.includes("apbd")) pendanaan = "APBD";
      else if (s.includes("apbn")) pendanaan = "APBN";
      else if (s.includes("sponsor")) pendanaan = "Sponsor / Swasta";
      else if (s.includes("mandiri")) pendanaan = "Mandiri";
      else if (s.includes("hibah")) pendanaan = "Hibah";

      sdmPendanaanMap[pendanaan] = (sdmPendanaanMap[pendanaan] || 0) + 1;
    });
    return Object.entries(sdmPendanaanMap).map(([name, value]) => ({ name, value }));
  }, [filteredKinerjaList]);

  // Prestasi Atlet (Indikator 1 & 6) Logic
  const rawAtletList: any[] = atletData.rawList || [];

  const filteredAtletList = useMemo(() => {
    if (selectedAtletIndicator === "all") return rawAtletList;
    const targetId = parseInt(selectedAtletIndicator);
    return rawAtletList.filter((r) => r.indicatorId === targetId);
  }, [rawAtletList, selectedAtletIndicator]);

  const activeAtletCalculatedStats = useMemo(() => {
    const medalStats = {
      Internasional: { Emas: 0, Perak: 0, Perunggu: 0, Partisipasi: 0 },
      Nasional: { Emas: 0, Perak: 0, Perunggu: 0, Partisipasi: 0 },
      Provinsi: { Emas: 0, Perak: 0, Perunggu: 0, Partisipasi: 0 },
    };
    let totalBobotScore = 0;

    let totalPelajarCount = 0;
    let totalAtletCount = 0;

    rawAtletList.forEach((r) => {
      if (r.indicatorId === 1) totalPelajarCount += 1;
      if (r.indicatorId === 6) totalAtletCount += 1;
    });

    const weightMatrix = atletData.weightMatrix || {
      Internasional: { emas: 10, perak: 8, perunggu: 5, partisipasi: 0 },
      Nasional: { emas: 5, perak: 4, perunggu: 3, partisipasi: 0 },
      Provinsi: { emas: 3, perak: 2, perunggu: 1, partisipasi: 0 },
    };

    filteredAtletList.forEach((r) => {
      const valLevel = (r.tingkatPenyelenggaraan || "").toLowerCase();
      let keyLevel: "Internasional" | "Nasional" | "Provinsi" = "Provinsi";
      if (valLevel.includes("internasional")) keyLevel = "Internasional";
      else if (valLevel.includes("nasional")) keyLevel = "Nasional";

      const valMedal = (r.medali || r.uraianCapaian || "").toLowerCase();
      let medal = "";
      if (valMedal.includes("emas")) medal = "Emas";
      else if (valMedal.includes("perak")) medal = "Perak";
      else if (valMedal.includes("perunggu")) medal = "Perunggu";

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

    const atletChartData = [
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
    ];

    const perbandinganPelajarAtletStats = [
      { name: "Pelajar (Indikator 1)", value: totalPelajarCount },
      { name: "Atlet (Indikator 6)", value: totalAtletCount },
    ];

    return {
      totalBobotScore,
      atletChartData,
      perbandinganPelajarAtletStats,
      totalPelajarCount,
      totalAtletCount,
      weightMatrix,
    };
  }, [rawAtletList, filteredAtletList, atletData.weightMatrix]);

  // Ambil raw data untuk tabel berdasarkan kategori
  let categoryRawData: any[] = [];
  if (selectedCategory === "mutuSDM") categoryRawData = mutuData.rawList || [];
  else if (selectedCategory === "kinerjaSDM") categoryRawData = filteredKinerjaList;
  else if (selectedCategory === "prestasiAtlet") categoryRawData = filteredAtletList;
  else if (selectedCategory === "eventOlahraga") categoryRawData = eventData.rawList || [];
  else if (selectedCategory === "prestasiKejuaraan") categoryRawData = kejuaraanData.rawList || [];

  // Filter raw data berdasarkan kata kunci pencarian di tabel
  const currentRawData = useMemo(() => {
    if (!tableSearchQuery.trim()) return categoryRawData;
    const q = tableSearchQuery.toLowerCase();
    return categoryRawData.filter((item) => {
      const fieldsToSearch = [
        item.namaLengkap,
        item.jenisKelamin,
        item.kabupatenKotaAsal,
        item.kecamatan,
        item.pekerjaanJabatan,
        item.nomorTelepon,
        item.namaKegiatan,
        item.cabangOlahraga,
        item.tingkatPenyelenggaraan,
        item.sumberPendanaan,
        item.medali,
        item.uraianCapaian,
        item.validationEvidence?.fileName,
      ];
      return fieldsToSearch.some(
        (field) => field && String(field).toLowerCase().includes(q)
      );
    });
  }, [categoryRawData, tableSearchQuery]);

  if (!mounted || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Throbber message="Memuat visualisasi & statistik..." />
      </div>
    );
  }

  const activeCategoryObj = CATEGORIES.find((c) => c.key === selectedCategory)!;
  const isAdmin = currentUser?.role === "ADMIN";

  // Check if current responden has data in selected category
  const hasCategoryData = (catKey: CategoryKey): boolean => {
    if (catKey === "mutuSDM") return (mutuData.totalRecords || 0) > 0;
    if (catKey === "kinerjaSDM") return filteredKinerjaList.length > 0;
    if (catKey === "prestasiAtlet") return filteredAtletList.length > 0;
    if (catKey === "eventOlahraga") return (eventData.totalRecords || 0) > 0;
    if (catKey === "prestasiKejuaraan") return (kejuaraanData.totalRecords || 0) > 0;
    return false;
  };

  // Hitung batas pagination
  const totalPages = Math.max(1, Math.ceil(currentRawData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = currentRawData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner Visualisasi & Evaluasi Data Keolahragaan */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#04331d] via-[#07482b] to-[#042917] text-white p-6 sm:p-10 shadow-elevated border border-emerald-800/40">
        {/* Decorative Bar Chart Icon Graphic on Right Side */}
        <div className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-10 pointer-events-none hidden md:block opacity-20">
          <svg
            className="w-44 h-52 text-emerald-200"
            viewBox="0 0 160 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Bar 1 (Short) */}
            <rect x="20" y="90" width="30" height="80" rx="6" fill="currentColor" />
            {/* Bar 2 (Tall) */}
            <rect x="65" y="40" width="30" height="130" rx="6" fill="currentColor" />
            {/* Bar 3 (Medium) */}
            <rect x="110" y="70" width="30" height="100" rx="6" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Visualisasi &amp; Evaluasi Data Keolahragaan
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {isAdmin
              ? "Dashboard Admin untuk memantau sebaran demografi, mutu SDM, capaian prestasi atlet, serta statistik event keolahragaan daerah."
              : `Selamat datang, ${currentUser?.nama || "Responden"}. Halaman ini menampilkan visualisasi grafik dan kalkulasi bobot prestasi dari kuesioner yang telah Anda masukkan.`}
          </p>
        </div>
      </div>

      {/* 2. Mode Admin UI Filters (Wajib untuk Admin) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl p-6 border border-brand-primary/20 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-brand-primary">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-brand-text flex items-center gap-2">
                  Filter Data Agregasi Admin
                  <span className="text-xs px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-semibold">
                    Fungsional Real-time
                  </span>
                </h2>
                <p className="text-xs text-brand-text-secondary">
                  Gunakan filter di bawah ini untuk menyesuaikan parameter wilayah, instansi, dan responden.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetAdminFilter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            </div>
          </div>

          {adminFilterMessage && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium flex items-center gap-2 animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 text-brand-primary" />
              <span>{adminFilterMessage}</span>
            </div>
          )}

          {/* 3 Dropdown Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter 1: Kota / Kabupaten */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                <span>1. Kabupaten / Kota</span>
              </label>
              <select
                value={selectedKota}
                onChange={(e) => setSelectedKota(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-brand-text bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
              >
                <option value="">-- Semua Kota / Kabupaten --</option>
                {(adminFiltersData?.listKota?.length ? adminFiltersData.listKota : KABUPATEN_KOTA_OPTIONS).map((kota: string, idx: number) => (
                  <option key={idx} value={kota}>
                    {kota}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Instansi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                <span>2. Instansi Keolahragaan</span>
              </label>
              <select
                value={selectedInstansi}
                onChange={(e) => setSelectedInstansi(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-brand-text bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
              >
                <option value="">-- Semua Instansi --</option>
                {(adminFiltersData?.listInstansi?.length ? adminFiltersData.listInstansi : INSTANSI_OPTIONS).map((inst: string, idx: number) => (
                  <option key={idx} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Responden */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-text flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-brand-primary" />
                <span>3. Spesifik Responden</span>
              </label>
              <select
                value={selectedRespondenId}
                onChange={(e) => setSelectedRespondenId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-brand-text bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
              >
                <option value="">-- Semua Responden ({adminFiltersData?.listResponden?.length || 0}) --</option>
                {adminFiltersData?.listResponden?.map((resp: any) => (
                  <option key={resp.id} value={resp.id}>
                    {resp.nama} ({resp.kabupatenKota || "Samarinda"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleApplyAdminFilter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover shadow-subtle transition-all"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Terapkan Filter UI</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Dropdown Menu & Tab Bar Selector (Kategori Statistik) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              PILIH KATEGORI STATISTIK
            </span>
            <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
              <span>{activeCategoryObj.label}</span>
            </h2>
          </div>

          {/* Selector Mobile / Dropdown Select */}
          <div className="w-full sm:w-72">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryKey)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-brand-primary/30 text-xs font-bold text-brand-primary bg-teal-50/60 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none appearance-none cursor-pointer transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-brand-primary absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tab Buttons Desktop/Tablet */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl text-center transition-all duration-200 border ${
                  isActive
                    ? "bg-brand-primary text-white border-brand-primary shadow-md font-bold scale-[1.02]"
                    : "bg-gray-50 text-brand-text-secondary border-gray-100 hover:bg-teal-50/50 hover:text-brand-primary hover:border-teal-200 hover:shadow-sm"
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isActive ? "text-white" : "text-brand-primary"}`} />
                <span className="text-sm font-semibold leading-tight">{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-brand-text-secondary bg-gray-50 p-3 rounded-xl border border-gray-100">
          <strong>Keterangan Kategori:</strong> {activeCategoryObj.description}
        </p>
      </div>

      {/* 4. Display Selected Category Visualizations */}
      <div className="space-y-6">
        {selectedCategory === "mutuSDM" && (
          <MutuSDMSection mutuData={mutuData} hasCategoryData={hasCategoryData} />
        )}
        {selectedCategory === "kinerjaSDM" && (
          <KinerjaSDMSection
            selectedKinerjaIndicator={selectedKinerjaIndicator}
            setSelectedKinerjaIndicator={setSelectedKinerjaIndicator}
            filteredKinerjaList={filteredKinerjaList}
            activeKinerjaJenjangStats={activeKinerjaJenjangStats}
            activeKinerjaPendanaanStats={activeKinerjaPendanaanStats}
            hasCategoryData={hasCategoryData}
          />
        )}
        {selectedCategory === "prestasiAtlet" && (
          <PrestasiAtletSection
            selectedAtletIndicator={selectedAtletIndicator}
            setSelectedAtletIndicator={setSelectedAtletIndicator}
            filteredAtletList={filteredAtletList}
            rawAtletList={rawAtletList}
            activeAtletCalculatedStats={activeAtletCalculatedStats}
            hasCategoryData={hasCategoryData}
          />
        )}
        {selectedCategory === "eventOlahraga" && (
          <EventOlahragaSection eventData={eventData} hasCategoryData={hasCategoryData} />
        )}
        {selectedCategory === "prestasiKejuaraan" && (
          <PrestasiKejuaraanSection kejuaraanData={kejuaraanData} hasCategoryData={hasCategoryData} />
        )}
      </div>

      {/* 5. Tabel Data Mentah (Raw Data) dengan Search, Pagination, & Berkas Validasi */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-card mt-8 space-y-5 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
              Tabel Detail Data – {activeCategoryObj.shortLabel}
            </h3>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 text-xs rounded-full border border-emerald-200/60">
              Total: {currentRawData.length} Entri Data
            </span>
          </div>

          {/* Search Box Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari di tabel data..."
              value={tableSearchQuery}
              onChange={(e) => {
                setTableSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-800 bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none transition-all"
            />
            {tableSearchQuery && (
              <button
                onClick={() => {
                  setTableSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200/80">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F4F6FA] border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                <th className="py-3.5 px-4">NO</th>
                
                {/* Header Kolom Berdasarkan Kategori */}
                {selectedCategory === "prestasiAtlet" ? (
                  <>
                    <th className="py-3.5 px-4">INDIKATOR</th>
                    <th className="py-3.5 px-4">NAMA KEGIATAN</th>
                    <th className="py-3.5 px-4">CABANG OLAHRAGA</th>
                    <th className="py-3.5 px-4">TINGKAT</th>
                    <th className="py-3.5 px-4">PENDANAAN</th>
                    <th className="py-3.5 px-4">MEDALI</th>
                    <th className="py-3.5 px-4">URAIAN CAPAIAN</th>
                    <th className="py-3.5 px-4 text-center">BERKAS VALIDASI</th>
                  </>
                ) : (
                  <>
                    <th className="py-3.5 px-4">INDIKATOR</th>
                    <th className="py-3.5 px-4">NAMA KEGIATAN</th>
                    <th className="py-3.5 px-4">CABANG OLAHRAGA</th>
                    <th className="py-3.5 px-4">TINGKAT</th>
                    <th className="py-3.5 px-4">PENDANAAN</th>
                    <th className="py-3.5 px-4">URAIAN CAPAIAN</th>
                    <th className="py-3.5 px-4 text-center">BERKAS VALIDASI</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {currentTableData.length > 0 ? (
                currentTableData.map((row, idx) => {
                  const fileUrl = row.validationEvidence?.fileUrl;
                  const fileName = row.validationEvidence?.fileName || "Berkas Validasi.pdf";
                  const jk = String(row.jenisKelamin || "").toLowerCase();
                  const isMale = jk.includes("laki") || jk.startsWith("l");

                  return (
                    <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {startIndex + idx + 1}
                      </td>
                      
                      {selectedCategory === "prestasiAtlet" || row.indicatorId === 1 || row.indicatorId === 6 ? (
                        <>
                          <td className="py-3.5 px-4 text-gray-500">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/60">
                              {row.indicatorId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">{row.namaKegiatan}</td>
                          <td className="py-3.5 px-4 text-gray-700">{row.cabangOlahraga}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                              {row.tingkatPenyelenggaraan}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700">{row.sumberPendanaan}</td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            {row.medali || "-"}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-xs text-gray-500 line-clamp-2" title={row.uraianCapaian}>
                              {row.uraianCapaian || "-"}
                            </p>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3.5 px-4 text-gray-500">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/60">
                              {row.indicatorId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-gray-900">{row.namaKegiatan}</td>
                          <td className="py-3.5 px-4 text-gray-700">{row.cabangOlahraga}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                              {row.tingkatPenyelenggaraan}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700">{row.sumberPendanaan}</td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-xs text-gray-500 line-clamp-2" title={row.uraianCapaian}>
                              {row.uraianCapaian || "-"}
                            </p>
                          </td>
                        </>
                      )}

                      {/* Kolom Berkas Validasi */}
                      <td className="py-3.5 px-4 text-center">
                        {fileUrl ? (
                          <a
                            href={fileUrl.startsWith("/uploads/") ? `/api/files/download?url=${encodeURIComponent(fileUrl)}` : fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-none"
                            title={`Buka ${fileName}`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat Berkas</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200">
                            Tidak Ada
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={selectedCategory === "prestasiAtlet" ? 9 : 8} className="py-12 text-center text-sm text-gray-400">
                    {tableSearchQuery ? (
                      <span>Tidak ada rekaman data yang cocok dengan pencarian &quot;{tableSearchQuery}&quot;.</span>
                    ) : (
                      <span>Tidak ada rekaman data untuk ditampilkan di kategori ini.</span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Kontrol Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <span className="text-xs font-medium text-gray-500">
            Menampilkan <span className="font-bold text-gray-900">{currentRawData.length === 0 ? 0 : startIndex + 1}</span> dari <span className="font-bold text-gray-900">{currentRawData.length}</span> entri
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Sebelumnya
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-brand-primary text-white shadow-sm' 
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDataChartHint({ title }: { title: string }) {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
      <div className="p-3 rounded-full bg-teal-50 text-brand-primary">
        <BarChart3 className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-xs font-bold text-brand-text">{title}</h4>
        <p className="text-xs text-brand-text-secondary">
          Data grafik belum tersedia karena entri kuesioner pada indikator ini belum diisikan.
        </p>
      </div>
      <Link
        href="/kuesioner"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover shadow-subtle transition-all"
      >
        <span>Isi Kuesioner Sekarang</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
