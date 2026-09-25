"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  | "demografi"
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
    key: "demografi",
    label: "1. Demografi SDM Olahraga",
    shortLabel: "Demografi SDM",
    icon: Users,
    description: "Profil identitas responden: sebaran jenis kelamin dan kelompok usia.",
  },
  {
    key: "mutuSDM",
    label: "2. Peningkatan Mutu SDM",
    shortLabel: "Mutu SDM",
    icon: GraduationCap,
    description: "Evaluasi pelatihan dan penataran SDM Olahraga (Wasit, Pelatih, Juri, dll) serta perbandingan sumber pendanaan.",
  },
  {
    key: "kinerjaSDM",
    label: "3. Kinerja SDM",
    shortLabel: "Kinerja SDM",
    icon: TrendingUp,
    description: "Evaluasi jenjang penugasan Wasit, Pelatih, Juri pada kejuaraan serta perbandingan sumber pendanaan operasional.",
  },
  {
    key: "prestasiAtlet",
    label: "4. Prestasi Atlet",
    shortLabel: "Prestasi Atlet",
    icon: Medal,
    description: "Visualisasi perolehan medali (Provinsi, Nasional, Internasional) dan hasil kalkulasi bobot poin capaian.",
  },
  {
    key: "eventOlahraga",
    label: "5. Statistik Penyelenggara Event Olahraga",
    shortLabel: "Penyelenggara Event",
    icon: Calendar,
    description: "Sebaran tingkat penyelenggaraan event keolahragaan dan analisis asal sumber pendanaan kegiatan.",
  },
  {
    key: "prestasiKejuaraan",
    label: "6. Prestasi Kejuaraan",
    shortLabel: "Prestasi Kejuaraan",
    icon: Trophy,
    description: "Distribusi partisipasi dan capaian kejuaraan beserta struktur pendanaan pendukung.",
  },
];

export default function StatistikPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("demografi");
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
    };
  }, [rawAtletList, filteredAtletList]);

  // Ambil raw data untuk tabel berdasarkan kategori
  let categoryRawData: any[] = [];
  if (selectedCategory === "demografi") categoryRawData = demografiData.identitiesList || demografiData.rawList || [];
  else if (selectedCategory === "mutuSDM") categoryRawData = mutuData.rawList || [];
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-brand-text-secondary">
          Memuat visualisasi & statistik...
        </p>
      </div>
    );
  }

  const activeCategoryObj = CATEGORIES.find((c) => c.key === selectedCategory)!;
  const isAdmin = currentUser?.role === "ADMIN";

  // Check if current responden has data in selected category
  const hasCategoryData = (catKey: CategoryKey): boolean => {
    if (catKey === "demografi") return (demografiData.totalResponden || 0) > 0;
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
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-brand-primary to-sky-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pusat Analytics & Dashboard Statistik ARINDAMA</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Visualisasi & Evaluasi Data Keolahragaan
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {isAdmin
              ? "Dashboard Admin untuk memantau sebaran demografi, mutu SDM, capaian prestasi atlet, serta statistik event keolahragaan daerah."
              : `Selamat datang, ${currentUser?.nama || "Responden"}. Halaman ini menampilkan visualisasi grafik dan kalkulasi bobot prestasi dari kuesioner yang telah Anda masukkan.`}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium">
            <span className="px-3 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
              Role: <strong className="text-brand-accent">{isAdmin ? "ADMINISTRATOR" : "RESPONDEN"}</strong>
            </span>
            {currentUser?.kabupatenKota && (
              <span className="px-3 py-1 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
                Daerah: <strong>{currentUser.kabupatenKota}</strong>
              </span>
            )}
          </div>
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
                {adminFiltersData?.listKota?.map((kota: string, idx: number) => (
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
                {adminFiltersData?.listInstansi?.map((inst: string, idx: number) => (
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
                    {resp.nama} ({resp.kabupatenKota || "Surabaya"})
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
        <div className="hidden lg:grid grid-cols-3 xl:grid-cols-6 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-all duration-150 border ${
                  isActive
                    ? "bg-brand-primary text-white border-brand-primary shadow-subtle font-bold"
                    : "bg-gray-50 text-brand-text-secondary border-gray-100 hover:bg-teal-50/50 hover:text-brand-primary hover:border-teal-200"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isActive ? "text-white" : "text-brand-primary"}`} />
                <span className="text-xs leading-tight">{cat.shortLabel}</span>
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
        {/* CATEGORY A: DEMOGRAFI SDM OLAHRAGA */}
        {selectedCategory === "demografi" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Total Entri Identitas</span>
                <div className="text-2xl font-extrabold text-brand-primary">
                  {demografiData.totalResponden || 0} <span className="text-xs font-normal text-gray-500">Responden</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Rasio Jenis Kelamin</span>
                <div className="text-lg font-bold text-brand-text flex items-center gap-2">
                  <span className="text-teal-700">L: {demografiData.jenisKelaminStats?.[0]?.value || 0}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sky-700">P: {demografiData.jenisKelaminStats?.[1]?.value || 0}</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Diagram Lingkaran Jenis Kelamin */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Proporsi Jenis Kelamin Responden</span>
                </h3>

                {hasCategoryData("demografi") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={demografiData.jenisKelaminStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {demografiData.jenisKelaminStats.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Demografi" />
                )}
              </div>

              {/* Chart 2: Distribusi Kelompok Umur */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-primary" />
                  <span>Sebaran Kelompok Usia Responden</span>
                </h3>

                {hasCategoryData("demografi") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={demografiData.umurStats || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Jumlah Responden" fill="#0284C7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Usia Responden" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY B: PENINGKATAN MUTU SDM */}
        {selectedCategory === "mutuSDM" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Form Terkait</span>
                <div className="text-sm font-bold text-brand-primary">Indikator 2</div>
                <p className="text-xs text-gray-400">Peningkatan Mutu SDM (Pelatihan & Penataran)</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Total Rekam Pelatihan</span>
                <div className="text-2xl font-extrabold text-brand-primary">
                  {mutuData.totalRecords || 0} <span className="text-xs font-normal text-gray-500">Kegiatan</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Tingkat Pelatihan Utama</span>
                <div className="text-sm font-bold text-brand-text">
                  {mutuData.jenjangPenugasanStats?.find((j: any) => j.value > 0)?.name || "Provinsi / Nasional"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart 1: Jenjang Pelatihan / Penataran */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Diagram Lingkaran 1: Jenjang Pelatihan / Penataran SDM</span>
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Rasio tingkat kegiatan penataran/pelatihan (Provinsi, Nasional, &amp; Internasional).
                </p>

                {hasCategoryData("mutuSDM") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mutuData.jenjangPenugasanStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {mutuData.jenjangPenugasanStats?.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Pelatihan SDM (Indikator 2)" />
                )}
              </div>

              {/* Pie Chart 2: Sumber Pendanaan Pelatihan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Diagram Lingkaran 2: Sumber Pendanaan Pelatihan</span>
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Distribusi persentase asal sumber pendanaan kegiatan pelatihan/penataran SDM.
                </p>

                {hasCategoryData("mutuSDM") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mutuData.sumberPendanaanStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {mutuData.sumberPendanaanStats?.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[(index + 3) % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Pendanaan Pelatihan SDM" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY C: KINERJA SDM */}
        {selectedCategory === "kinerjaSDM" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Form Terkait</span>
                <div className="text-sm font-bold text-brand-primary">
                  {selectedKinerjaIndicator === "all"
                    ? "Indikator 3, 4, & 5"
                    : `Indikator ${selectedKinerjaIndicator}`}
                </div>
                <p className="text-xs text-gray-400">Wasit, Pelatih, Juri (Penugasan Kejuaraan)</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Total Rekam Penugasan</span>
                <div className="text-2xl font-extrabold text-brand-primary">
                  {filteredKinerjaList.length} <span className="text-xs font-normal text-gray-500">Kegiatan</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <label className="text-xs font-semibold text-brand-text-secondary flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Pilih Indikator SDM</span>
                </label>
                <select
                  value={selectedKinerjaIndicator}
                  onChange={(e) => setSelectedKinerjaIndicator(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-brand-text bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer transition-all"
                >
                  <option value="all">semua (ambil dari 3 indikator)</option>
                  <option value="3">Indikator 3 (Pelatih)</option>
                  <option value="4">Indikator 4 (Wasit)</option>
                  <option value="5">indikator 5 (Juri)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart 1: Jenjang Penugasan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Diagram Lingkaran 1: Jenjang Penugasan SDM</span>
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Rasio SDM Olahraga (Wasit, Pelatih, Juri) pada level Kejuaraan Provinsi, Nasional, &amp; Internasional.
                </p>

                {hasCategoryData("kinerjaSDM") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeKinerjaJenjangStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {activeKinerjaJenjangStats.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Penugasan SDM (Indikator 3-5)" />
                )}
              </div>

              {/* Pie Chart 2: Sumber Pendanaan SDM */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Diagram Lingkaran 2: Sumber Pendanaan SDM</span>
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Distribusi persentase asal sumber pendanaan operasional penugasan SDM Olahraga.
                </p>

                {hasCategoryData("kinerjaSDM") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeKinerjaPendanaanStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {activeKinerjaPendanaanStats.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[(index + 3) % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Pendanaan SDM" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY C: PRESTASI ATLET */}
        {selectedCategory === "prestasiAtlet" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Indicator Filter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Form Terkait</span>
                <div className="text-sm font-bold text-brand-primary">
                  {selectedAtletIndicator === "all"
                    ? "Indikator 1 & 6"
                    : selectedAtletIndicator === "1"
                    ? "Indikator 1 (Pelajar)"
                    : "Indikator 6 (Atlet)"}
                </div>
                <p className="text-xs text-gray-400">Prestasi Atlet & Pelajar Keolahragaan</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <span className="text-xs font-semibold text-brand-text-secondary">Total Rekam Prestasi</span>
                <div className="text-2xl font-extrabold text-brand-primary">
                  {filteredAtletList.length} <span className="text-xs font-normal text-gray-500">Kegiatan</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
                <label className="text-xs font-semibold text-brand-text-secondary flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Pilih Indikator Prestasi</span>
                </label>
                <select
                  value={selectedAtletIndicator}
                  onChange={(e) => setSelectedAtletIndicator(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-brand-text bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer transition-all"
                >
                  <option value="all">semua (indikator 1, indikator 6)</option>
                  <option value="1">pelajar (indikator 1)</option>
                  <option value="6">atlet (indikator 6)</option>
                </select>
              </div>
            </div>

            {/* Top Score & Medal Weight Formula Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Calculated Medal Weight Score Card */}
              <div className="lg:col-span-1 bg-gradient-to-br from-amber-500 via-amber-600 to-teal-800 text-white rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-xs font-semibold text-amber-200">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Total Poin Bobot Medali</span>
                  </div>
                  <h3 className="text-xs uppercase tracking-wider text-amber-100 font-semibold">
                    Skor Capaian Prestasi
                  </h3>
                  <div className="text-4xl font-extrabold tracking-tight">
                    {activeAtletCalculatedStats.totalBobotScore}{" "}
                    <span className="text-sm font-normal text-amber-200">Poin</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20 text-xs text-amber-100/90 leading-relaxed space-y-1">
                  <p>
                    <strong>Form Sumber:</strong>{" "}
                    {selectedAtletIndicator === "all"
                      ? "Indikator 1 & 6"
                      : selectedAtletIndicator === "1"
                      ? "Indikator 1 (Pelajar)"
                      : "Indikator 6 (Atlet)"}
                  </p>
                  <p>
                    Skor dikalkulasikan secara otomatis berdasarkan pembobotan resmi tingkat kejuaraan & jenis medali.
                  </p>
                </div>
              </div>

              {/* Weight Score Formula Reference Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-primary" />
                  <span>Matriks Perhitungan Bobot Poin Medali</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Internasional */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                    <span className="font-bold text-amber-900 block border-b border-amber-200 pb-1">
                      Tingkat Internasional
                    </span>
                    <div className="flex justify-between">
                      <span>Emas</span> <strong className="text-amber-800">10 Poin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Perak</span> <strong className="text-amber-800">8 Poin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Perunggu</span> <strong className="text-amber-800">5 Poin</strong>
                    </div>
                    <div className="flex justify-between border-t border-amber-200/60 pt-1">
                      <span>Partisipan</span> <strong className="text-gray-600">0 Poin</strong>
                    </div>
                  </div>

                  {/* Nasional */}
                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1.5">
                    <span className="font-bold text-sky-900 block border-b border-sky-200 pb-1">
                      Tingkat Nasional
                    </span>
                    <div className="flex justify-between">
                      <span>Emas</span> <strong className="text-sky-800">5 Poin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Perak</span> <strong className="text-sky-800">4 Poin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Perunggu</span> <strong className="text-sky-800">3 Poin</strong>
                    </div>
                    <div className="flex justify-between border-t border-sky-200/60 pt-1">
                      <span>Partisipan</span> <strong className="text-gray-600">0 Poin</strong>
                    </div>
                  </div>

                  {/* Provinsi */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                    <span className="font-bold text-emerald-900 block border-b border-emerald-200 pb-1">
                      Tingkat Provinsi
                    </span>
                    <div className="flex justify-between">
                      <span>Emas</span> <strong className="text-emerald-800">3 Poin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Perak</span> <strong className="text-emerald-800">2 Poin</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Perunggu</span> <strong className="text-emerald-800">1 Poin</strong>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200/60 pt-1">
                      <span>Partisipan</span> <strong className="text-gray-600">0 Poin</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid: Pie Chart Comparison & Bar Chart Medals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagram 1: Pie Chart Perbandingan Pelajar vs Atlet */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Diagram Lingkaran 1: Perbandingan Rekam Prestasi Pelajar vs Atlet</span>
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Distribusi dan rasio perbandingan rekam data prestasi antara Pelajar (Indikator 1) dan Atlet (Indikator 6).
                </p>

                {rawAtletList.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activeAtletCalculatedStats.perbandinganPelajarAtletStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`
                          }
                        >
                          <Cell key="cell-pelajar" fill="#0F766E" />
                          <Cell key="cell-atlet" fill="#0284C7" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Rekam Pelajar & Atlet (Indikator 1 & 6)" />
                )}
              </div>

              {/* Diagram 2: Bar Chart Perolehan Medali & Partisipasi per Jenjang */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-primary" />
                  <span>Diagram Batang 2: Perbandingan Medali &amp; Partisipan per Jenjang</span>
                </h3>
                <p className="text-xs text-brand-text-secondary">
                  Sebaran hasil perolehan medali (Emas, Perak, Perunggu) dan partisipan berdasarkan indikator terpilih.
                </p>

                {hasCategoryData("prestasiAtlet") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activeAtletCalculatedStats.atletChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="jenjang" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Emas" name="Medali Emas" fill={MEDAL_COLORS.Emas} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Perak" name="Medali Perak" fill={MEDAL_COLORS.Perak} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Perunggu" name="Medali Perunggu" fill={MEDAL_COLORS.Perunggu} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Partisipasi" name="Partisipan / Non-Medali" fill="#0284C7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Prestasi untuk Filter Terpilih" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY D: STATISTIK PENYELENGGARA EVENT OLAHRAGA */}
        {selectedCategory === "eventOlahraga" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-brand-text-secondary">Sumber Data</span>
              <div className="text-sm font-bold text-brand-primary">Indikator 7 - Penyelenggara Event Olahraga</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagram 1: Pendanaan Event */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Diagram 1: Distribusi Asal Sumber Pendanaan Event</span>
                </h3>

                {hasCategoryData("eventOlahraga") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={eventData.sumberPendanaanStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {eventData.sumberPendanaanStats?.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Event Olahraga (Indikator 7)" />
                )}
              </div>

              {/* Diagram 2: Tingkat Kejuaraan Event */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-primary" />
                  <span>Diagram 2: Sebaran Tingkat Penyelenggaraan Event</span>
                </h3>

                {hasCategoryData("eventOlahraga") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={eventData.tingkatKejuaraanStats || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Jumlah Event" fill="#0F766E" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Sebaran Event" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY E: PRESTASI KEJUARAAN */}
        {selectedCategory === "prestasiKejuaraan" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-brand-text-secondary">Sumber Data</span>
              <div className="text-sm font-bold text-brand-primary">Indikator 8 - Keikutsertaan & Prestasi Kejuaraan</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagram 1: Pendanaan Kejuaraan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-brand-primary" />
                  <span>Diagram 1: Distribusi Sumber Pendanaan Kejuaraan</span>
                </h3>

                {hasCategoryData("prestasiKejuaraan") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={kejuaraanData.sumberPendanaanStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {kejuaraanData.sumberPendanaanStats?.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLOR_PALETTE[(index + 2) % COLOR_PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Kejuaraan (Indikator 8)" />
                )}
              </div>

              {/* Diagram 2: Tingkat Kejuaraan */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-primary" />
                  <span>Diagram 2: Sebaran Tingkat Kejuaraan Yang Diikuti</span>
                </h3>

                {hasCategoryData("prestasiKejuaraan") ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kejuaraanData.tingkatKejuaraanStats || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Kejuaraan Diikuti" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyDataChartHint title="Belum Ada Data Tingkat Kejuaraan" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Tabel Data Mentah (Raw Data) dengan Search, Pagination, & Berkas Validasi */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8 space-y-4 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
              <span>Tabel Detail Data - {activeCategoryObj.shortLabel}</span>
            </h3>
            <span className="text-xs font-semibold text-brand-primary bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-100 inline-block mt-1">
              Total: {currentRawData.length} Entri Data
            </span>
          </div>

          {/* Search Box Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari di tabel data..."
              value={tableSearchQuery}
              onChange={(e) => {
                setTableSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs font-medium text-brand-text bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
            />
            {tableSearchQuery && (
              <button
                onClick={() => {
                  setTableSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="py-3.5 px-4 text-xs font-bold text-brand-text">No</th>
                
                {/* Header Kolom Berdasarkan Kategori */}
                {selectedCategory === "demografi" ? (
                  <>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Nama Lengkap</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Jenis Kelamin</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Umur</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Asal Wilayah</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Pekerjaan/Jabatan</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Telepon</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text text-center">Berkas Validasi</th>
                  </>
                ) : selectedCategory === "prestasiAtlet" ? (
                  <>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Indikator</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Nama Kegiatan</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Cabang Olahraga</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Tingkat</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Pendanaan</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Medali</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Uraian Capaian</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text text-center">Berkas Validasi</th>
                  </>
                ) : (
                  <>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Indikator</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Nama Kegiatan</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Cabang Olahraga</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Tingkat</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Pendanaan</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text">Uraian Capaian</th>
                    <th className="py-3.5 px-4 text-xs font-bold text-brand-text text-center">Berkas Validasi</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentTableData.length > 0 ? (
                currentTableData.map((row, idx) => {
                  const fileUrl = row.validationEvidence?.fileUrl;
                  const fileName = row.validationEvidence?.fileName || "Berkas Validasi.pdf";

                  return (
                    <tr key={row.id || idx} className="hover:bg-teal-50/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-500 font-medium">
                        {startIndex + idx + 1}
                      </td>
                      
                      {selectedCategory === "demografi" ? (
                        <>
                          <td className="py-3 px-4 text-sm font-bold text-brand-text">{row.namaLengkap}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{row.jenisKelamin}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{row.umur} Thn</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {row.kabupatenKotaAsal}<br/>
                            <span className="text-xs text-gray-400">Kec. {row.kecamatan}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{row.pekerjaanJabatan}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{row.nomorTelepon}</td>
                        </>
                      ) : selectedCategory === "prestasiAtlet" || row.indicatorId === 1 || row.indicatorId === 6 ? (
                        <>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-brand-primary/10 text-brand-primary font-bold text-xs">
                              {row.indicatorId}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-brand-text">{row.namaKegiatan}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{row.cabangOlahraga}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                              {row.tingkatPenyelenggaraan}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{row.sumberPendanaan}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 font-medium">
                            {row.medali || "-"}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                            <p className="text-xs text-gray-500 line-clamp-2" title={row.uraianCapaian}>
                              {row.uraianCapaian || "-"}
                            </p>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-brand-primary/10 text-brand-primary font-bold text-xs">
                              {row.indicatorId}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-brand-text">{row.namaKegiatan}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{row.cabangOlahraga}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                              {row.tingkatPenyelenggaraan}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{row.sumberPendanaan}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">
                            <p className="text-xs text-gray-500 line-clamp-2" title={row.uraianCapaian}>
                              {row.uraianCapaian || "-"}
                            </p>
                          </td>
                        </>
                      )}

                      {/* Kolom Berkas Validasi (Tombol) */}
                      <td className="py-3 px-4 text-center">
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm transition-all"
                            title={`Buka ${fileName}`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat Berkas</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200">
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
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <span className="text-xs font-medium text-brand-text-secondary">
              Menampilkan <span className="font-bold text-brand-text">{startIndex + 1}</span> sampai{" "}
              <span className="font-bold text-brand-text">{Math.min(startIndex + itemsPerPage, currentRawData.length)}</span>{" "}
              dari total <span className="font-bold text-brand-text">{currentRawData.length}</span> data
            </span>
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm text-brand-text transition-all"
              >
                Prev
              </button>
              
              <div className="flex items-center gap-0.5 px-2 overflow-x-auto max-w-[150px] sm:max-w-xs hide-scrollbar">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`min-w-[28px] h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-brand-primary text-white shadow-md' 
                        : 'text-gray-500 hover:bg-white hover:text-brand-text'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:shadow-sm text-brand-text transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
