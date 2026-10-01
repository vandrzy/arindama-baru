"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/context/app-context";
import {
  Search,
  Calendar,
  Filter,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Shield,
  Clock,
  UserCheck,
  UserPlus,
  UserCog,
  KeyRound,
  Sliders,
  Calculator,
  CheckSquare,
  Sparkles,
} from "lucide-react";

// Tipe Data Log Aktivitas
export interface LogItem {
  id: string;
  waktu: string;
  rawDate: string; // YYYY-MM-DD untuk filter tanggal
  aktorNama: string;
  aktorEmail: string;
  aktorRole: "ADMIN" | "OPERATOR";
  aksi:
    | "Login"
    | "Tambah Pengguna"
    | "Ubah Pengguna"
    | "Reset Sandi"
    | "Verifikasi Kegiatan"
    | "Ubah Bobot"
    | "Hitung Ulang Skor"
    | "Bersihkan Log";
  targetModule: string;
  targetId: string;
  ipAddress: string;
  userAgent: string;
  detailDeskripsi: string;
}

// Mock Data Awal yang Kaya & Variatif
const MOCK_LOGS: LogItem[] = [
  {
    id: "LOG-20261001-001",
    waktu: "01 Okt 2026, 10.23",
    rawDate: "2026-10-01",
    aktorNama: "Rahmat Hidayat, S.Or.",
    aktorEmail: "operator.samarinda@arindama.id",
    aktorRole: "OPERATOR",
    aksi: "Login",
    targetModule: "users",
    targetId: "USR-OP-SMD",
    ipAddress: "180.252.19.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
    detailDeskripsi: "Autentikasi berhasil masuk ke dashboard operator Kota Samarinda.",
  },
  {
    id: "LOG-20261001-002",
    waktu: "01 Okt 2026, 07.26",
    rawDate: "2026-10-01",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Login",
    targetModule: "users",
    targetId: "USR-ADMIN",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    detailDeskripsi: "Autentikasi berhasil masuk sebagai Administrator Utama.",
  },
  {
    id: "LOG-20261001-003",
    waktu: "01 Okt 2026, 07.17",
    rawDate: "2026-10-01",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Ubah Bobot",
    targetModule: "bobot_dinamis",
    targetId: "BBT-CRIT-04",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    detailDeskripsi: "Memperbarui bobot kriteria Keolahragaan Pendidikan dari 0.25 menjadi 0.30.",
  },
  {
    id: "LOG-20261001-004",
    waktu: "01 Okt 2026, 07.15",
    rawDate: "2026-10-01",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Hitung Ulang Skor",
    targetModule: "kuesioner_rekap",
    targetId: "RKP-2026-Q3",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    detailDeskripsi: "Memicu kalkulasi ulang skor agregat responden untuk seluruh kabupaten/kota se-Kaltim.",
  },
  {
    id: "LOG-20261001-005",
    waktu: "01 Okt 2026, 07.09",
    rawDate: "2026-10-01",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Login",
    targetModule: "users",
    targetId: "USR-ADMIN",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    detailDeskripsi: "Autentikasi berhasil masuk sebagai Administrator Utama.",
  },
  {
    id: "LOG-20260930-006",
    waktu: "30 Sep 2026, 16.45",
    rawDate: "2026-09-30",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Tambah Pengguna",
    targetModule: "users",
    targetId: "USR-OP-BALIKPAPAN",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
    detailDeskripsi: "Menambahkan akun Operator baru untuk Dinas Pemuda dan Olahraga Kota Balikpapan.",
  },
  {
    id: "LOG-20260930-007",
    waktu: "30 Sep 2026, 14.10",
    rawDate: "2026-09-30",
    aktorNama: "Siti Aminah, S.STP",
    aktorEmail: "operator.kukar@arindama.id",
    aktorRole: "OPERATOR",
    aksi: "Verifikasi Kegiatan",
    targetModule: "responden",
    targetId: "RSP-KUKAR-089",
    ipAddress: "103.247.218.12",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0.0.0",
    detailDeskripsi: "Melakukan verifikasi berkas bukti fisik kegiatan keolahragaan Kabupaten Kutai Kartanegara.",
  },
  {
    id: "LOG-20260929-008",
    waktu: "29 Sep 2026, 11.20",
    rawDate: "2026-09-29",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Reset Sandi",
    targetModule: "users",
    targetId: "USR-OP-PASER",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
    detailDeskripsi: "Mereset kata sandi akun Operator Kabupaten Paser atas permintaan pengguna.",
  },
  {
    id: "LOG-20260928-009",
    waktu: "28 Sep 2026, 09.05",
    rawDate: "2026-09-28",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Ubah Pengguna",
    targetModule: "users",
    targetId: "USR-OP-BERAU",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
    detailDeskripsi: "Memperbarui data instansi dan nomor telepon Operator Kabupaten Berau.",
  },
  {
    id: "LOG-20260615-010",
    waktu: "15 Jun 2026, 08.00",
    rawDate: "2026-06-15",
    aktorNama: "Drs. H. Hendra Wijaya, M.Si.",
    aktorEmail: "admin@arindama.id",
    aktorRole: "ADMIN",
    aksi: "Bersihkan Log",
    targetModule: "system_logs",
    targetId: "SYS-LOG-PURGE",
    ipAddress: "114.125.40.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0",
    detailDeskripsi: "Pembersihan rutin log sistem yang melebihi batas retensi 90 hari.",
  },
];

export default function LogAktivitasPage() {
  const { currentUser } = useApp();

  // State pencarian dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("Semua Aksi");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State Modal Detail Log
  const [activeDetailLog, setActiveDetailLog] = useState<LogItem | null>(null);

  // State Modal Bersihkan Log (>90 hari)
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // State Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State Data Logs (Dukungan Hapus / Purge)
  const [logsList, setLogsList] = useState<LogItem[]>(MOCK_LOGS);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Log berdasarkan kriteria
  const filteredLogs = useMemo(() => {
    return logsList.filter((log) => {
      // 1. Filter Pencarian Teks (Nama, Email, ID Target, ID Log)
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.aktorNama.toLowerCase().includes(q) ||
        log.aktorEmail.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q) ||
        log.detailDeskripsi.toLowerCase().includes(q);

      // 2. Filter Dropdown Aksi
      const matchAction =
        selectedAction === "Semua Aksi" || log.aksi === selectedAction;

      // 3. Filter Rentang Tanggal
      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && log.rawDate >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && log.rawDate <= endDate;
      }

      return matchSearch && matchAction && matchDate;
    });
  }, [logsList, searchQuery, selectedAction, startDate, endDate]);

  // Hitung total halaman & data paginasi
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Handler Hapus Log > 90 hari
  const handlePurgeLogs = async () => {
    setIsPurging(true);
    // Simulasi pembersihan log lama
    setTimeout(() => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const cutoffStr = ninetyDaysAgo.toISOString().split("T")[0];

      setLogsList((prev) => prev.filter((item) => item.rawDate >= cutoffStr));
      setIsPurging(false);
      setIsPurgeModalOpen(false);

      setToastMessage("Berhasil membersihkan log aktivitas yang berusia > 90 hari.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 600);
  };

  // Helper render badge aksi
  const renderActionBadge = (aksi: LogItem["aksi"]) => {
    switch (aksi) {
      case "Login":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Login
          </span>
        );
      case "Tambah Pengguna":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Tambah Pengguna
          </span>
        );
      case "Ubah Pengguna":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Ubah Pengguna
          </span>
        );
      case "Reset Sandi":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Reset Sandi
          </span>
        );
      case "Verifikasi Kegiatan":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Verifikasi Kegiatan
          </span>
        );
      case "Ubah Bobot":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Ubah Bobot
          </span>
        );
      case "Hitung Ulang Skor":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Hitung Ulang Skor
          </span>
        );
      case "Bersihkan Log":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Bersihkan Log
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {aksi}
          </span>
        );
    }
  };

  // Verifikasi Hak Akses Admin (Fallback untuk kenyamanan UI preview)
  if (currentUser && currentUser.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Shield className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Akses Terbatas</h2>
        <p className="text-slate-500 max-w-md mt-1 text-sm">
          Halaman Log Aktivitas hanya dapat diakses oleh akun Administrator Utama.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER HALAMAN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Log Aktivitas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jejak audit aksi pengguna — retensi 90 hari — Khusus Admin
          </p>
        </div>

        {/* Tombol Bersihkan > 90 Hari */}
        <button
          onClick={() => setIsPurgeModalOpen(true)}
          className="border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs sm:text-sm rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4 text-slate-500" />
          <span>Bersihkan &gt; 90 Hari</span>
        </button>
      </div>

      {/* KOTAK SEARCH & FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Input Pencarian */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktor (nama/email/ID)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 w-full placeholder:text-slate-400 text-slate-800 font-medium transition-all"
          />
        </div>

        {/* Filter Dropdown Aksi */}
        <div className="shrink-0">
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium w-full md:w-auto min-w-[160px] cursor-pointer"
          >
            <option value="Semua Aksi">Semua Aksi</option>
            <option value="Login">Login</option>
            <option value="Tambah Pengguna">Tambah Pengguna</option>
            <option value="Ubah Pengguna">Ubah Pengguna</option>
            <option value="Reset Sandi">Reset Sandi</option>
            <option value="Verifikasi Kegiatan">Verifikasi Kegiatan</option>
            <option value="Ubah Bobot">Ubah Bobot</option>
            <option value="Hitung Ulang Skor">Hitung Ulang Skor</option>
            <option value="Bersihkan Log">Bersihkan Log</option>
          </select>
        </div>

        {/* Filter Tanggal Mulai & Akhir */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-40">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium"
            />
          </div>
          <span className="text-slate-400 text-xs">-</span>
          <div className="relative flex-1 md:w-40">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Tombol Filter / Reset */}
        <button
          onClick={() => setCurrentPage(1)}
          className="bg-[#0b1329] hover:bg-[#162244] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
        >
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* CARD TABEL LOG AKTIVITAS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Total Peristiwa Status Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>{filteredLogs.length} peristiwa tercatat</span>
          </div>
          {(searchQuery || selectedAction !== "Semua Aksi" || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedAction("Semua Aksi");
                setStartDate("");
                setEndDate("");
                setCurrentPage(1);
              }}
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
                  WAKTU
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  AKTOR
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                  AKSI
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TARGET
                </th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  DETAIL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada log aktivitas ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba ubah kata kunci pencarian atau filter aksi.
                    </p>
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* WAKTU */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs font-medium">
                      {log.waktu}
                    </td>

                    {/* AKTOR */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {log.aktorNama}
                        </span>
                        <span className="text-slate-400 text-xs font-normal">
                          {log.aktorEmail}
                        </span>
                      </div>
                    </td>

                    {/* AKSI */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {renderActionBadge(log.aksi)}
                    </td>

                    {/* TARGET */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-slate-700 font-medium text-xs">
                          {log.targetModule}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {log.targetId}
                        </span>
                      </div>
                    </td>

                    {/* DETAIL */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setActiveDetailLog(log)}
                        className="text-blue-600 font-semibold text-xs hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-colors"
                      >
                        Lihat
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
            Halaman {currentPage} dari {totalPages} ({filteredLogs.length} data)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              aria-label="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              aria-label="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL LOG */}
      {activeDetailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  Rincian Log Aktivitas
                </h3>
              </div>
              <button
                onClick={() => setActiveDetailLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ID LOG
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    {activeDetailLog.id}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    WAKTU
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {activeDetailLog.waktu}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  AKTOR / PENGGUNA
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {activeDetailLog.aktorNama}
                    </p>
                    <p className="text-xs text-slate-500">
                      {activeDetailLog.aktorEmail}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                    {activeDetailLog.aktorRole}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    JENIS AKSI
                  </span>
                  <div>{renderActionBadge(activeDetailLog.aksi)}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    TARGET ENTITAS
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {activeDetailLog.targetModule}{" "}
                    <span className="font-mono text-slate-400 font-normal">
                      ({activeDetailLog.targetId})
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  DESKRIPSI PERISTIWA
                </span>
                <p className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                  {activeDetailLog.detailDeskripsi}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Alamat IP:</span>
                  <span className="font-mono font-medium text-slate-700">
                    {activeDetailLog.ipAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Agent:</span>
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[260px]" title={activeDetailLog.userAgent}>
                    {activeDetailLog.userAgent}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setActiveDetailLog(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BERSIHKAN LOG > 90 HARI */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Bersihkan Log &gt; 90 Hari
                </h3>
                <p className="text-xs text-slate-500">Pembersihan Retensi Log</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus semua jejak log aktivitas yang berusia lebih dari 90 hari? Action ini akan menghapus riwayat lama secara permanen dari basis data.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                disabled={isPurging}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handlePurgeLogs}
                disabled={isPurging}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Membersihkan...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Bersihkan Log</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
