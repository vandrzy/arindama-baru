"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useApp } from "@/lib/context/app-context";
import { Modal } from "@/components/ui/modal";
import {
  Award,
  Users,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Trophy,
  Medal,
  RefreshCw,
} from "lucide-react";

// Types
export interface PeraihanMedaliRecord {
  id: string;
  categoryId: number;
  kategori: "Pelajar" | "Atlet";
  namaKegiatan: string;
  cabangOlahraga: string;
  tingkatPenyelenggaraan: string;
  sumberPendanaan: string;
  medali: string;
  uraianCapaian?: string;
  status: string;
  createdAt: string;
  submissionId: string;
  responden: {
    nik: string;
    nama: string;
    kabupatenKota: string;
    kecamatan: string;
    cabangOlahraga: string;
    nomorTelepon: string;
  };
  evidences: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
  }>;
}

export interface OverviewSummary {
  totalMedali: number;
  totalResponden: number;
}

const KALTUM_CITIES = [
  "Kota Samarinda",
  "Kota Balikpapan",
  "Kota Bontang",
  "Kab. Kutai Kartanegara",
  "Kab. Kutai Timur",
  "Kab. Kutai Barat",
  "Kab. Berau",
  "Kab. Penajam Paser Utara",
  "Kab. Paser",
  "Kab. Mahakam Ulu",
];

export default function PeraihanMedaliPage() {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === "ADMIN";
  const userCity = currentUser?.kabupatenKota || "";

  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLokasi, setSelectedLokasi] = useState<string>(
    isAdmin ? "Kalimantan Timur" : userCity || "Kalimantan Timur"
  );
  const [selectedMedali, setSelectedMedali] = useState<string>("Semua");
  const [selectedTingkatPenyelenggaraan, setSelectedTingkatPenyelenggaraan] =
    useState<string>("Semua");
  const [selectedTingkatan, setSelectedTingkatan] = useState<string>("Semua");

  // State Data API
  const [summary, setSummary] = useState<OverviewSummary>({
    totalMedali: 0,
    totalResponden: 0,
  });
  const [records, setRecords] = useState<PeraihanMedaliRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal Berkas
  const [activeEvidenceModal, setActiveEvidenceModal] =
    useState<PeraihanMedaliRecord | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Sync operator lokasi jika user context terload
  useEffect(() => {
    if (!isAdmin && userCity) {
      setSelectedLokasi(userCity);
    }
  }, [isAdmin, userCity]);

  // Fetch Data dari API Backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedLokasi) params.append("lokasi", selectedLokasi);
      if (selectedMedali !== "Semua") params.append("medali", selectedMedali);
      if (selectedTingkatPenyelenggaraan !== "Semua")
        params.append("tingkatPenyelenggaraan", selectedTingkatPenyelenggaraan);
      if (selectedTingkatan !== "Semua")
        params.append("tingkatan", selectedTingkatan);

      const res = await fetch(`/api/peraihan-medali?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memuat data peraihan medali");
      }

      setSummary(data.summary || { totalMedali: 0, totalResponden: 0 });
      setRecords(data.records || []);
    } catch (err: any) {
      console.error("Error fetching peraihan medali:", err);
      setError(err.message || "Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedLokasi,
    selectedMedali,
    selectedTingkatPenyelenggaraan,
    selectedTingkatan,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Paginasi
  const totalPages = Math.ceil(records.length / itemsPerPage) || 1;
  const currentRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return records.slice(start, start + itemsPerPage);
  }, [records, currentPage, itemsPerPage]);

  // Handler Reset Filter
  const handleResetFilter = () => {
    setSearchQuery("");
    if (isAdmin) {
      setSelectedLokasi("Kalimantan Timur");
    }
    setSelectedMedali("Semua");
    setSelectedTingkatPenyelenggaraan("Semua");
    setSelectedTingkatan("Semua");
    setCurrentPage(1);
  };

  // Render Badge Medali
  const renderMedalBadge = (medaliName: string) => {
    const lower = (medaliName || "").toLowerCase();
    if (lower.includes("emas")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/80 shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Emas</span>
        </span>
      );
    }
    if (lower.includes("perak")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-xs">
          <Medal className="w-3.5 h-3.5 text-slate-500 fill-slate-400" />
          <span>Perak</span>
        </span>
      );
    }
    if (lower.includes("perunggu")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-950 border border-orange-300/80 shadow-xs">
          <Medal className="w-3.5 h-3.5 text-orange-700 fill-orange-600" />
          <span>Perunggu</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <Award className="w-3.5 h-3.5 text-emerald-600" />
        <span>{medaliName}</span>
      </span>
    );
  };

  // Header Title Dinamis
  const headerTitle = isAdmin
    ? "Peraihan Medali di Kalimantan Timur"
    : `Peraihan Medali di ${userCity || "Daerah"}`;

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>{headerTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi perolehan medali berstatus sah & terverifikasi bersumber dari Kategori 2 (Pelajar) dan Kategori 7 (Atlet)
          </p>
        </div>

        <button
          onClick={() => fetchData()}
          className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs sm:text-sm rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 2 CARD OVERVIEW (STATISTIK) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Total Medali Berstatus Sah */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-amber-200/80 transition-all duration-200">
          <div className="space-y-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              TOTAL MEDALI BERSTATUS SAH
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : summary.totalMedali.toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Sah & Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Gabungan akumulasi medali dari Kategori 2 (Pelajar) & Kategori 7 (Atlet)
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Total Responden Meraih Medali */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-blue-200/80 transition-all duration-200">
          <div className="space-y-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              TOTAL RESPONDEN MERAIH MEDALI
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : summary.totalResponden.toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                Responden Unik
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Jumlah individu responden yang mengantongi prestasi medali terverifikasi
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* FILTER & PENCARIAN CARD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari NIK / nama / kegiatan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 w-full placeholder:text-slate-400 text-slate-800 font-medium transition-all"
            />
          </div>

          {/* Dropdown Lokasi */}
          <div>
            <select
              value={selectedLokasi}
              disabled={!isAdmin}
              onChange={(e) => {
                setSelectedLokasi(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium cursor-pointer ${
                !isAdmin ? "opacity-75 bg-slate-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="Kalimantan Timur">Kalimantan Timur (Semua)</option>
              {KALTUM_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Medali */}
          <div>
            <select
              value={selectedMedali}
              onChange={(e) => {
                setSelectedMedali(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Medali</option>
              <option value="Emas">Emas</option>
              <option value="Perak">Perak</option>
              <option value="Perunggu">Perunggu</option>
            </select>
          </div>

          {/* Dropdown Tingkat Penyelenggara */}
          <div>
            <select
              value={selectedTingkatPenyelenggaraan}
              onChange={(e) => {
                setSelectedTingkatPenyelenggaraan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Tingkat</option>
              <option value="Provinsi">Provinsi</option>
              <option value="Nasional">Nasional</option>
              <option value="Internasional">Internasional</option>
            </select>
          </div>

          {/* Dropdown Tingkatan (Pelajar / Atlet) */}
          <div>
            <select
              value={selectedTingkatan}
              onChange={(e) => {
                setSelectedTingkatan(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Tingkatan</option>
              <option value="Pelajar">Pelajar (Kategori 2)</option>
              <option value="Atlet">Atlet (Kategori 7)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchData()}
            className="font-bold underline hover:text-rose-900"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* CARD TABEL DAFTAR PERAIHAN MEDALI */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Info */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400" />
            <span>{records.length} data medali sah terdaftar</span>
          </div>

          {(searchQuery ||
            (isAdmin && selectedLokasi !== "Kalimantan Timur") ||
            selectedMedali !== "Semua" ||
            selectedTingkatPenyelenggaraan !== "Semua" ||
            selectedTingkatan !== "Semua") && (
            <button
              onClick={handleResetFilter}
              className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  NAMA & NIK
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  DOMISILI
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  NAMA KEGIATAN & CABOR
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  MEDALI
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 mx-auto text-slate-300 animate-spin mb-2" />
                    <p className="font-semibold text-slate-600 text-xs sm:text-sm">
                      Memuat data peraihan medali...
                    </p>
                  </td>
                </tr>
              ) : currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">
                      Tidak ada data peraihan medali ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau pilihan filter di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                currentRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* NAMA & NIK */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {rec.responden.nama}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              rec.kategori === "Pelajar"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {rec.kategori}
                          </span>
                        </div>
                        <span className="text-slate-400 text-xs font-mono mt-0.5">
                          NIK: {rec.responden.nik}
                        </span>
                      </div>
                    </td>

                    {/* DOMISILI */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 text-xs sm:text-sm">
                          {rec.responden.kabupatenKota}
                        </span>
                        <span className="text-slate-400 text-xs">
                          Kec. {rec.responden.kecamatan}
                        </span>
                      </div>
                    </td>

                    {/* NAMA KEGIATAN & CABOR */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-md">
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2">
                          {rec.namaKegiatan}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-slate-500">
                            Cabor: {rec.cabangOlahraga || "-"}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-medium text-slate-500">
                            {rec.tingkatPenyelenggaraan}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* MEDALI */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {renderMedalBadge(rec.medali)}
                    </td>

                    {/* AKSI */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setActiveEvidenceModal(rec)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Lihat Berkas</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER & PAGINASI */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Halaman {currentPage} dari {totalPages} ({records.length} total data)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              aria-label="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL LIHAT BERKAS BUKTI FISIK */}
      {activeEvidenceModal && (
        <Modal isOpen={true} onClose={() => setActiveEvidenceModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Berkas Bukti Fisik Medali
                </h3>
              </div>
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-sm">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {activeEvidenceModal.responden.nama}
                  </span>
                  {renderMedalBadge(activeEvidenceModal.medali)}
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  {activeEvidenceModal.namaKegiatan}
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  {activeEvidenceModal.responden.kabupatenKota} •{" "}
                  {activeEvidenceModal.kategori}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Daftar Berkas Terlampir ({activeEvidenceModal.evidences.length})
                </span>

                {activeEvidenceModal.evidences.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Belum ada lampiran file bukti fisik untuk kegiatan ini.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeEvidenceModal.evidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[280px]">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {ev.fileName}
                          </span>
                        </div>
                        <a
                          href={ev.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 shrink-0"
                        >
                          <span>Buka File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {activeEvidenceModal.uraianCapaian && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Uraian Capaian
                  </span>
                  <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                    {activeEvidenceModal.uraianCapaian}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setActiveEvidenceModal(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
