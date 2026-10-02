"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  User,
  Medal,
  Award,
  FileCheck,
  Loader2,
  Trophy,
  Activity,
  BarChart3,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Search,
  Globe
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";

function getKategoriFromSkor(skor: number) {
  if (skor > 600) return { label: "Tinggi", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  if (skor > 400) return { label: "Menengah", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
  return { label: "Rendah", color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" };
}

export function AdminView() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedPilar, setSelectedPilar] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pilarOptions = ["Semua", "Prestasi (KONI)", "Disabilitas (NPC)", "Masyarakat (KORMI)", "Dispora"];

  useEffect(() => {
    fetchData();
  }, [selectedPilar, currentPage, pageSize, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?pilar=${selectedPilar}&page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        console.error("Gagal mengambil data dashboard:", json.error);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  const kompositSkor = data?.totalKomposit || 0;
  const kompositStatus = getKategoriFromSkor(kompositSkor);

  // Table search filtering & pagination logic (now server-side)
  const paginatedSubmissions = data?.recentSubmissions || [];
  const totalItems = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, validCurrentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-8">
      {/* 1. HEADER HALAMAN DASHBOARD */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            TINGKAT PROVINSI KALIMANTAN TIMUR
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Overview Indeks Capaian Olahraga Daerah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sistem evaluasi komprehensif 9 Kategori Keolahragaan tingkat Kabupaten/Kota &amp; Provinsi
          </p>
        </div>

        {/* Filter Pilar (Berada di bawah Header) */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-white p-1.5 rounded-full border border-slate-200/80 shadow-sm overflow-x-auto self-start">
          {pilarOptions.map(opt => {
            const isSelected = selectedPilar === opt;
            let icon = null;
            if (opt === "Prestasi (KONI)") icon = <Trophy className="w-3 h-3" />;
            else if (opt === "Disabilitas (NPC)") icon = <Activity className="w-3 h-3" />;
            else if (opt === "Masyarakat (KORMI)") icon = <Users className="w-3 h-3" />;

            return (
              <button
                key={opt}
                onClick={() => setSelectedPilar(opt)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-[#0e1726] text-white shadow-sm"
                    : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {icon}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DERETAN KARTU STATISTIK (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: INDEKS KOMPOSIT (Soft Green Tint) */}
        <div className="p-5 rounded-2xl bg-[#f0fdf4] border border-[#dcfce7] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
              INDEKS KOMPOSIT
            </span>
            <div className="w-9 h-9 rounded-full bg-[#dcfce7] flex items-center justify-center text-[#16a34a] shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {kompositSkor.toLocaleString("id-ID")}
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
                {kompositStatus.label}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-400">
              Skor gabungan 9 kategori se-Kaltim
            </p>
          </div>
        </div>

        {/* Card 2: RESPONDEN TERDATA (Soft Blue/Indigo Tint) */}
        <div className="p-5 rounded-2xl bg-[#f4f7ff] border border-[#e0e7ff] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
              ATLET / RESPONDEN TERDATA
            </span>
            <div className="w-9 h-9 rounded-full bg-[#e0e7ff] flex items-center justify-center text-[#4f46e5] shrink-0">
              <User className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {(data?.totalResponden ?? data?.totalOperator ?? 0).toLocaleString("id-ID")}
            </div>

            <p className="text-xs font-medium text-slate-400">
              Total responden terdaftar di sistem
            </p>
          </div>
        </div>

        {/* Card 3: MEDALI KEJUARAAN (Soft Yellow/Cream Tint) */}
        <div className="p-5 rounded-2xl bg-[#fffdf2] border border-[#fef08a] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
              MEDALI KEJUARAAN
            </span>
            <div className="w-9 h-9 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706] shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {(data?.medaliSah?.total || 0).toLocaleString("id-ID")}
            </div>

            <div className="space-y-1.5">
              {/* Row 1: Tersebar Kab/Kota */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#fef3c7] text-[#b45309]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]"></span>
                  Tersebar di 10 Kab/Kota
                </span>
              </div>

              {/* Row 2: Emas & Perak */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#fef08a]/90 text-[#854d0e] border border-yellow-200/80">
                  <Award className="w-3.5 h-3.5 text-[#b45309]" />
                  {data?.medaliSah?.emas || 0} Emas
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#e2e8f0]/90 text-[#334155] border border-slate-200/80">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  {data?.medaliSah?.perak || 0} Perak
                </span>
              </div>

              {/* Row 3: Perunggu */}
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#ffedd5] text-[#9a3412] border border-orange-200/80">
                  <Award className="w-3.5 h-3.5 text-[#c2410c]" />
                  {data?.medaliSah?.perunggu || 0} Perunggu
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: ANTREAN VERIFIKASI (Soft Pink/Red Tint) */}
        <div className="p-5 rounded-2xl bg-[#fff5f5] border border-[#ffe4e6] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-700">
              ANTREAN VERIFIKASI
            </span>
            <div className="w-9 h-9 rounded-full bg-[#ffe4e6] flex items-center justify-center text-[#e11d48] shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {data?.antreanValidasi || 8}
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffe4e6] text-[#be123c]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]"></span>
                Menunggu Audit Verifikator
              </span>
            </div>

            <p className="text-xs font-medium text-slate-400">
              {data?.totalDataTerverifikasi || 47} berkas telah disahkan resmi
            </p>
          </div>
        </div>
      </div>

      {/* 3. BAGIAN TENGAH (PILAR & REKAPITULASI CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Klasifikasi 3 Pilar Keolahragaan */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-slate-100 shadow-sm rounded-2xl bg-white flex flex-col h-full justify-between">
            <div>
              <div className="mb-5">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Klasifikasi 3 Pilar Keolahragaan
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Pembagian skor indeks berdasarkan pilar keolahragaan
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { id: "KONI", title: "Olahraga Prestasi", subtitle: "KONI / Cabor Resmi", skor: data?.pilarScores?.KONI || 0, icon: <Trophy className="w-4 h-4" />, iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                  { id: "KORMI", title: "Olahraga Masyarakat", subtitle: "KORMI / Kebugaran & Tradisional", skor: data?.pilarScores?.KORMI || 0, icon: <Users className="w-4 h-4" />, iconBg: "bg-amber-50 text-amber-600 border-amber-100" },
                  { id: "NPC", title: "Olahraga Disabilitas", subtitle: "NPC (National Paralympic Committee)", skor: data?.pilarScores?.NPC || 0, icon: <Activity className="w-4 h-4" />, iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100" },
                  { id: "Dispora", title: "Diaspora", subtitle: "Dinas Pemuda & Olahraga / Jejaring", skor: data?.pilarScores?.Dispora || 0, icon: <Globe className="w-4 h-4" />, iconBg: "bg-rose-50 text-rose-600 border-rose-100" }
                ].map((pilar, index) => {
                  const status = getKategoriFromSkor(pilar.skor);
                  return (
                    <div key={pilar.id} className="flex items-center justify-between pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${pilar.iconBg}`}>
                          {pilar.icon}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900">{pilar.title}</div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">{pilar.subtitle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-extrabold text-slate-900 mb-0.5">{pilar.skor} Poin</div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                STANDAR KATEGORI EVALUASI IPO
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Tinggi (&gt; 600)
                </span>
                <span className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Menengah (&gt; 400)
                </span>
                <span className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Rendah (&lt;= 400)
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Kolom Kanan: REKAPITULASI INDEKS BERJENJANG (Bar Chart) */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-slate-100 shadow-sm rounded-2xl bg-white h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                    REKAPITULASI INDEKS BERJENJANG
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {kompositSkor}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                      Total Poin Sah
                    </span>
                  </div>
                </div>
                <div className="self-start sm:self-auto bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-700 border border-slate-200">
                  Kabupaten/Kota
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-400 mb-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Arahkan kursor pada bar untuk rincian wilayah
              </div>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.chartWilayah || []}
                    margin={{ top: 25, right: 10, left: 10, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="namaWilayah"
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const skor = payload[0].value as number;
                          const status = getKategoriFromSkor(skor);
                          return (
                            <div className="bg-white p-3 border border-slate-200 shadow-xl rounded-xl">
                              <div className="text-xs font-bold text-slate-500 mb-1">{label}</div>
                              <div className="text-base font-extrabold text-slate-900">Skor: {skor}</div>
                              <div className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${status.color}`}>
                                {status.label}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="skor"
                      radius={[12, 12, 12, 12]}
                      maxBarSize={55}
                      background={{ fill: '#f8fafc', radius: 12 }}
                    >
                      <LabelList dataKey="skor" position="top" style={{ fontSize: '11px', fontWeight: 'bold', fill: '#0f172a' }} offset={10} />
                      {
                        (data?.chartWilayah || []).map((entry: any, index: number) => {
                          const status = getKategoriFromSkor(entry.skor);
                          let barColor = "#10b981"; // emerald-500
                          if (status.label === "Menengah") barColor = "#f59e0b"; // amber-500
                          if (status.label === "Rendah") barColor = "#f43f5e"; // rose-500

                          return <Cell key={`cell-${index}`} fill={barColor} />;
                        })
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Capaian Tertinggi: <span className="font-extrabold text-slate-900">{data?.chartWilayah?.[0]?.namaWilayah || "-"} ({data?.chartWilayah?.[0]?.skor || 0})</span>
              </div>
              <Link
                href="/dashboard/rekapitulasi-wilayah"
                className="font-bold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1"
              >
                <span>Buka Tabel Rekapitulasi Berjenjang</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. TABEL SUBMISI & VALIDASI BERKAS TERKINI */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        {/* Header Tabel */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Submisi &amp; Validasi Berkas Terkini
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Daftar entri kegiatan kejuaraan, sertifikat pendukung, dan status keabsahan dokumen
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kegiatan, cabor, peserta..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-800 bg-slate-50/50 placeholder:text-slate-400"
              />
            </div>

            {/* Tombol Atur Bobot */}
            <Link
              href="/dashboard/bobot-dinamis"
              className="flex items-center gap-2 bg-[#0e1726] hover:bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Atur Bobot</span>
            </Link>
          </div>
        </div>

        {/* Contents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="py-3.5 px-6 pl-8">NAMA KEGIATAN &amp; CABOR</th>
                <th className="py-3.5 px-6">ATLET / RESPONDEN</th>
                <th className="py-3.5 px-6">TINGKAT</th>
                <th className="py-3.5 px-6">CAPAIAN MEDALI</th>
                <th className="py-3.5 px-6 text-center">STATUS BERKAS</th>
                <th className="py-3.5 px-6 text-center pr-8">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-medium">
                    Belum ada data submisi berkas yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub: any, idx: number) => {
                  let statusBadge = (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      {sub.status || "Belum Upload"}
                    </span>
                  );

                  const statusLower = (sub.status || "").toLowerCase();
                  if (["sah", "sah & terverifikasi", "disetujui", "terunggah", "terverifikasi sah"].includes(statusLower)) {
                    statusBadge = (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Terverifikasi Sah
                      </span>
                    );
                  } else if (["menunggu validasi", "menunggu review", "belum upload", "proses"].includes(statusLower)) {
                    statusBadge = (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Menunggu Validasi
                      </span>
                    );
                  } else if (["perlu revisi", "revisi", "ditolak", "tidak sah"].includes(statusLower)) {
                    statusBadge = (
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        Tidak Sah
                      </span>
                    );
                  }

                  const medaliVal = sub.medali || "Emas";

                  return (
                    <tr key={sub.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 pl-8">
                        <div className="font-bold text-slate-900">{sub.namaKegiatan || sub.kejuaraan || "Kejuaraan Keolahragaan"}</div>
                        <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                          Kategori {sub.kategori || "3"} &bull; {sub.cabangOlahraga || sub.cabor || "Olahraga"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-700">{sub.peserta || sub.operator || "-"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                          {sub.tingkat || "Nasional"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          medaliVal.toLowerCase().includes("emas")
                            ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                            : medaliVal.toLowerCase().includes("perak")
                            ? "bg-slate-100 text-slate-700 border border-slate-200"
                            : "bg-amber-50 text-amber-900 border border-amber-200"
                        }`}>
                          <Medal className="w-3.5 h-3.5" />
                          {medaliVal}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {statusBadge}
                      </td>
                      <td className="py-4 px-6 text-center pr-8">
                        <Link
                          href="/kuesioner"
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel / Pagination */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/40">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <span>
              Menampilkan {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} dari {totalItems} data
            </span>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <span>Baris:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 / hal</option>
                <option value={25}>25 / hal</option>
                <option value={50}>50 / hal</option>
                <option value={100}>100 / hal</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validCurrentPage === 1}
              className={`p-1.5 rounded-lg border text-slate-700 bg-white transition-colors ${
                validCurrentPage === 1
                  ? "border-slate-200 text-slate-300 cursor-not-allowed opacity-50"
                  : "border-slate-200 hover:bg-slate-100"
              }`}
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  validCurrentPage === page
                    ? "bg-[#0e1726] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage === totalPages}
              className={`p-1.5 rounded-lg border text-slate-700 bg-white transition-colors ${
                validCurrentPage === totalPages
                  ? "border-slate-200 text-slate-300 cursor-not-allowed opacity-50"
                  : "border-slate-200 hover:bg-slate-100"
              }`}
              aria-label="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
