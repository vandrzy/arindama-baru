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
        {selectedCategory === "demografi" && (() => {
          const totalJk = (demografiData.jenisKelaminStats?.[0]?.value || 0) + (demografiData.jenisKelaminStats?.[1]?.value || 0);
          const maleCount = demografiData.jenisKelaminStats?.[0]?.value || 0;
          const femaleCount = demografiData.jenisKelaminStats?.[1]?.value || 0;
          const malePercent = totalJk > 0 ? Math.round((maleCount / totalJk) * 100) : 0;
          const femalePercent = totalJk > 0 ? Math.round((femaleCount / totalJk) * 100) : 0;

          const dominantAgeObj = (demografiData.umurStats || []).reduce((max: any, item: any) => (item.value > (max?.value || -1) ? item : max), null);
          const dominantAgeLabel = dominantAgeObj?.value > 0 ? dominantAgeObj.name : "20 – 30 Tahun";

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Total Entri Identitas */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-card flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Total Entri Identitas</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-none">
                        {demografiData.totalResponden || 0}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">Responden</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                    <Users className="w-6 h-6 text-emerald-700" />
                  </div>
                </div>

                {/* Card 2: Rasio Jenis Kelamin */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200/80 shadow-card flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Rasio Jenis Kelamin</span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none flex items-center gap-2">
                      <span>L: {maleCount}</span>
                      <span className="text-gray-300 font-light mx-1">|</span>
                      <span>P: {femaleCount}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                    <PieChartIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Donut Chart Proporsi Jenis Kelamin */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-card space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-800" />
                    <h3 className="text-base font-bold text-gray-900">
                      Proporsi Jenis Kelamin Responden
                    </h3>
                  </div>

                  {hasCategoryData("demografi") ? (
                    <div className="space-y-4">
                      <div className="h-64 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Laki-laki", value: maleCount > 0 ? maleCount : (femaleCount === 0 ? 1 : 0) },
                                { name: "Perempuan", value: femaleCount },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={68}
                              outerRadius={92}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell fill="#003820" />
                              <Cell fill="#E2E8F0" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        {/* Hole Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                            {malePercent >= femalePercent ? `${malePercent}%` : `${femalePercent}%`}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            {malePercent >= femalePercent ? "Laki-laki" : "Perempuan"}
                          </span>
                        </div>
                      </div>

                      {/* Legend Details */}
                      <div className="space-y-2 pt-2 text-center text-xs">
                        <div className="flex items-center justify-center gap-6 text-gray-700 font-semibold">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#003820]" />
                            Laki-laki: {malePercent}%
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                            Perempuan: {femalePercent}%
                          </span>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-gray-600 font-medium pt-1">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-[#003820]" /> Laki-laki
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-slate-200" /> Perempuan
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyDataChartHint title="Belum Ada Data Demografi" />
                  )}
                </div>

                {/* Chart 2: Bar Chart Sebaran Kelompok Usia */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-card space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
                      <BarChart3 className="w-5 h-5 text-emerald-800" />
                      <h3 className="text-base font-bold text-gray-900">
                        Sebaran Kelompok Usia Responden
                      </h3>
                    </div>

                    {hasCategoryData("demografi") ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={demografiData.umurStats || []}
                            margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                              dataKey="name"
                              tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }}
                              axisLine={{ stroke: "#CBD5E1" }}
                              tickLine={false}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 11, fill: "#64748B" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              name="Jumlah Responden"
                              fill="#003820"
                              radius={[6, 6, 0, 0]}
                              barSize={44}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <EmptyDataChartHint title="Belum Ada Data Usia Responden" />
                    )}
                  </div>

                  {/* Footer Details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs">
                    <span className="text-gray-600 font-medium">
                      Rentang Usia Dominan: <strong className="text-emerald-950 font-bold">{dominantAgeLabel}</strong>
                    </span>
                    <span className="bg-blue-100/80 text-blue-800 font-bold px-3 py-1 rounded-full text-xs border border-blue-200/60 shrink-0 self-start sm:self-auto">
                      Akumulasi: {demografiData.totalResponden || 0} Data
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
        {selectedCategory === "prestasiAtlet" && (() => {
          const totalPelajar = activeAtletCalculatedStats.totalPelajarCount || 0;
          const totalAtlet = activeAtletCalculatedStats.totalAtletCount || 0;
          const totalPelajarAtlet = totalPelajar + totalAtlet;
          const pelajarPercent = totalPelajarAtlet > 0 ? Math.round((totalPelajar / totalPelajarAtlet) * 100) : 50;
          const atletPercent = totalPelajarAtlet > 0 ? Math.round((totalAtlet / totalPelajarAtlet) * 100) : 50;

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Indicator Filter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-card space-y-1">
                  <span className="text-xs font-semibold text-gray-500">Form Terkait</span>
                  <div className="text-base font-bold text-gray-900">
                    {selectedAtletIndicator === "all"
                      ? "Indikator 1 & 6"
                      : selectedAtletIndicator === "1"
                      ? "Indikator 1 (Pelajar)"
                      : "Indikator 6 (Atlet)"}
                  </div>
                  <p className="text-xs text-gray-500">Prestasi Atlet &amp; Pelajar Keolahragaan</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-card flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-500">Total Rekam Prestasi</span>
                    <div className="text-2xl font-extrabold text-gray-900 leading-none">
                      {filteredAtletList.length} <span className="text-sm font-semibold text-gray-700">Kegiatan</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Trophy className="w-5 h-5 text-emerald-700" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-card space-y-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pilih Indikator Prestasi</span>
                  </label>
                  <select
                    value={selectedAtletIndicator}
                    onChange={(e) => setSelectedAtletIndicator(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none cursor-pointer transition-all"
                  >
                    <option value="all">semua (Indikator 1, Indikator 6)</option>
                    <option value="1">pelajar (Indikator 1)</option>
                    <option value="6">atlet (Indikator 6)</option>
                  </select>
                </div>
              </div>

              {/* Top Score & Medal Weight Formula Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Calculated Medal Weight Score Card */}
                <div className="lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-[#D97706] to-[#B45309] text-white rounded-3xl p-6 sm:p-7 shadow-card flex flex-col justify-between">
                  {/* Background Watermark Trophy Icon */}
                  <Trophy className="w-40 h-40 text-black/10 absolute -right-6 -bottom-6 pointer-events-none" />

                  <div className="relative z-10 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white backdrop-blur-sm shadow-sm">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Total Poin Bobot Medali</span>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-xs uppercase tracking-wider text-amber-100 font-bold">
                        SKOR CAPAIAN PRESTASI
                      </h3>
                      <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1">
                        {activeAtletCalculatedStats.totalBobotScore}{" "}
                        <span className="text-lg font-semibold text-amber-200">Poin</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-6 border-t border-white/20 text-xs text-amber-100/90 leading-relaxed space-y-1">
                    <p className="font-bold">
                      Form Sumber:{" "}
                      {selectedAtletIndicator === "all"
                        ? "Indikator 1 & 6"
                        : selectedAtletIndicator === "1"
                        ? "Indikator 1 (Pelajar)"
                        : "Indikator 6 (Atlet)"}
                    </p>
                    <p className="text-[11px] opacity-90">
                      Skor dikalkulasikan secara otomatis berdasarkan pembobotan resmi tingkat kejuaraan &amp; jenis medali.
                    </p>
                  </div>
                </div>

                {/* Weight Score Formula Reference Card */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-card space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-800" />
                        <span>Matriks Perhitungan Bobot Poin Medali</span>
                      </h3>
                      <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-md border border-purple-100">
                        SK Standar Kemenpora
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Internasional */}
                      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-1.5 font-bold text-amber-950">
                          <span>Tingkat Internasional</span>
                          <span>🌐</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-800 font-semibold">● Emas</span> <strong className="text-gray-900">10 Poin</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-800 font-semibold">● Perak</span> <strong className="text-gray-900">8 Poin</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-800 font-semibold">● Perunggu</span> <strong className="text-gray-900">5 Poin</strong>
                        </div>
                        <div className="flex justify-between border-t border-amber-200/50 pt-1.5 text-gray-500">
                          <span>Partisipan</span> <strong>0 Poin</strong>
                        </div>
                      </div>

                      {/* Nasional */}
                      <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-200/70 space-y-2">
                        <div className="flex items-center justify-between border-b border-sky-200/60 pb-1.5 font-bold text-sky-950">
                          <span>Tingkat Nasional</span>
                          <span>🚩</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-800 font-semibold">● Emas</span> <strong className="text-gray-900">5 Poin</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-800 font-semibold">● Perak</span> <strong className="text-gray-900">4 Poin</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sky-800 font-semibold">● Perunggu</span> <strong className="text-gray-900">3 Poin</strong>
                        </div>
                        <div className="flex justify-between border-t border-sky-200/50 pt-1.5 text-gray-500">
                          <span>Partisipan</span> <strong>0 Poin</strong>
                        </div>
                      </div>

                      {/* Provinsi */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
                        <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5 font-bold text-emerald-950">
                          <span>Tingkat Provinsi</span>
                          <span>🏛️</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-800 font-semibold">● Emas</span> <strong className="text-gray-900">3 Poin</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-800 font-semibold">● Perak</span> <strong className="text-gray-900">2 Poin</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-800 font-semibold">● Perunggu</span> <strong className="text-gray-900">1 Poin</strong>
                        </div>
                        <div className="flex justify-between border-t border-emerald-200/50 pt-1.5 text-gray-500">
                          <span>Partisipan</span> <strong>0 Poin</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
                    <p className="italic">
                      * Total perolehan skor daerah dihitung otomatis berdasarkan pembobotan resmi SK Kemenpora: Total {activeAtletCalculatedStats.totalBobotScore} Poin.
                    </p>
                    <span className="font-semibold text-emerald-700 shrink-0">⚙ Sinkron</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid: Pie Chart Comparison & Bar Chart Medals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Diagram 1: Pie Chart Perbandingan Pelajar vs Atlet */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-card space-y-4">
                  <div className="border-b border-gray-100 pb-3 space-y-1">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-emerald-800" />
                      <span>Diagram Lingkaran 1: Perbandingan Rekam Prestasi Pelajar vs Atlet</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Distribusi dan rasio perbandingan rekam data prestasi antara Pelajar (Indikator 1) dan Atlet (Indikator 6).
                    </p>
                  </div>

                  {rawAtletList.length > 0 ? (
                    <div className="space-y-4">
                      <div className="h-64 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={activeAtletCalculatedStats.perbandinganPelajarAtletStats}
                              cx="50%"
                              cy="50%"
                              innerRadius={68}
                              outerRadius={92}
                              startAngle={90}
                              endAngle={-270}
                              dataKey="value"
                              stroke="none"
                            >
                              <Cell key="cell-atlet" fill="#0284C7" />
                              <Cell key="cell-pelajar" fill="#003820" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>

                        {/* Hole Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">
                            {rawAtletList.length}
                          </span>
                          <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-1">
                            TOTAL REKAM
                          </span>
                        </div>
                      </div>

                      {/* Sub-labels Chips */}
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <span className="bg-sky-50 text-sky-800 font-bold px-3 py-1 rounded-lg border border-sky-100">
                          Atlet (Indikator 6): {atletPercent}%
                        </span>
                        <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-lg border border-emerald-100">
                          Pelajar (Indikator 1): {pelajarPercent}%
                        </span>
                      </div>

                      {/* Legend Details */}
                      <div className="flex items-center justify-center gap-6 pt-1 text-xs font-semibold text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[#0284C7]" /> Atlet (Indikator 6) ({totalAtlet})
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[#003820]" /> Pelajar (Indikator 1) ({totalPelajar})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <EmptyDataChartHint title="Belum Ada Data Rekam Pelajar & Atlet (Indikator 1 & 6)" />
                  )}
                </div>

                {/* Diagram 2: Bar Chart Perolehan Medali & Partisipasi per Jenjang */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-card space-y-4">
                  <div className="border-b border-gray-100 pb-3 space-y-1">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-800" />
                      <span>Diagram Batang 2: Perbandingan Medali &amp; Partisipan per Jenjang</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      Sebaran hasil perolehan medali (Emas, Perak, Perunggu) dan partisipan berdasarkan indikator terpilih.
                    </p>
                  </div>

                  {hasCategoryData("prestasiAtlet") ? (
                    <div className="space-y-4">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={activeAtletCalculatedStats.atletChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="jenjang" tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="Emas" name="Medali Emas" fill={MEDAL_COLORS.Emas} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Perak" name="Medali Perak" fill={MEDAL_COLORS.Perak} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Perunggu" name="Medali Perunggu" fill={MEDAL_COLORS.Perunggu} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Partisipasi" name="Partisipan / Non-Medali" fill="#0284C7" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Custom Legend Chips */}
                      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-700 pt-1">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> Medali Emas
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[#94A3B8]" /> Medali Perak ({activeAtletCalculatedStats.atletChartData.reduce((acc, curr) => acc + curr.Perak, 0)})
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[#D97706]" /> Medali Perunggu
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-[#0284C7]" /> Partisipan / Non-Medali ({activeAtletCalculatedStats.atletChartData.reduce((acc, curr) => acc + curr.Partisipasi, 0)})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <EmptyDataChartHint title="Belum Ada Data Prestasi untuk Filter Terpilih" />
                  )}
                </div>
              </div>
            </div>
          );
        })()}

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
                {selectedCategory === "demografi" ? (
                  <>
                    <th className="py-3.5 px-4">NAMA LENGKAP</th>
                    <th className="py-3.5 px-4">JENIS KELAMIN</th>
                    <th className="py-3.5 px-4">UMUR</th>
                    <th className="py-3.5 px-4">ASAL WILAYAH</th>
                    <th className="py-3.5 px-4">PEKERJAAN/JABATAN</th>
                    <th className="py-3.5 px-4">TELEPON</th>
                    <th className="py-3.5 px-4 text-center">BERKAS VALIDASI</th>
                  </>
                ) : selectedCategory === "prestasiAtlet" ? (
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
                      
                      {selectedCategory === "demografi" ? (
                        <>
                          <td className="py-3.5 px-4 font-bold text-gray-900">{row.namaLengkap}</td>
                          <td className="py-3.5 px-4">
                            {isMale ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200/50">
                                <span className="text-emerald-700">♂</span> Laki-laki
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200/50">
                                <span className="text-purple-700">♀</span> Perempuan
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-gray-700">{row.umur} Thn</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-gray-900">{row.kabupatenKotaAsal || "-"}</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">Kec. {row.kecamatan || "-"}</div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-700">{row.pekerjaanJabatan || "-"}</td>
                          <td className="py-3.5 px-4 text-gray-600 font-mono">{row.nomorTelepon || "-"}</td>
                        </>
                      ) : selectedCategory === "prestasiAtlet" || row.indicatorId === 1 || row.indicatorId === 6 ? (
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
                            href={fileUrl}
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
