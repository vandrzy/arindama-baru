"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  CalendarClock,
  RotateCcw,
  Unlock,
  Lock,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserX,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  History,
  Save,
  Sparkles,
  Info
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export default function BatasWaktuPage() {
  // Form State
  const [namaPeriode, setNamaPeriode] = useState(
    "Evaluasi Capaian Keolahragaan Provinsi Kalimantan Timur 2026"
  );
  const [tanggalMulai, setTanggalMulai] = useState("2026-01-01");
  const [batasAkhir, setBatasAkhir] = useState("2026-12-31");
  const [kebijakanAkses, setKebijakanAkses] = useState<"OTOMATIS" | "KUNCI_MANUAL">(
    "OTOMATIS"
  );

  // UI & Loading State
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [logHistory, setLogHistory] = useState<LogEntry[]>([]);

  // Fetch initial config & logs from API
  const fetchCutoffData = async () => {
    setLoading(true);
    try {
      const [configRes, logsRes] = await Promise.all([
        fetch("/api/config/cutoff"),
        fetch("/api/config/cutoff/logs"),
      ]);

      const configData = await configRes.json();
      if (configData.success && configData.config) {
        const c = configData.config;
        if (c.title) setNamaPeriode(c.title);
        if (c.startDate) setTanggalMulai(c.startDate);
        if (c.cutoffDate) setBatasAkhir(c.cutoffDate);
        if (c.kebijakanAkses) setKebijakanAkses(c.kebijakanAkses);
      }

      const logsData = await logsRes.json();
      if (logsData.success && Array.isArray(logsData.logs)) {
        const formattedLogs: LogEntry[] = logsData.logs.map((item: any) => ({
          id: item.id,
          timestamp: new Date(item.tanggal).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          user: item.adminNama || item.adminId || "Admin",
          action: item.actionNote || (item.statusBatasWaktu ? "Akses Terbuka" : "Akses Terkunci"),
        }));
        setLogHistory(formattedLogs);
      }
    } catch (err) {
      console.error("Gagal memuat data batas waktu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCutoffData();
  }, []);

  // Calculate Days Remaining
  const daysRemaining = useMemo(() => {
    try {
      const today = new Date();
      const cutoff = new Date(batasAkhir);
      cutoff.setHours(23, 59, 59, 999);
      const diffTime = cutoff.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  }, [batasAkhir]);

  // Compute System Status
  const isLocked = kebijakanAkses === "KUNCI_MANUAL" || daysRemaining < 0;

  // Handle Kebijakan Akses Change
  const handleKebijakanChange = (mode: "OTOMATIS" | "KUNCI_MANUAL") => {
    setKebijakanAkses(mode);
    if (mode === "KUNCI_MANUAL") {
      const todayStr = new Date().toISOString().split("T")[0];
      setBatasAkhir(todayStr);
    }
  };

  // Handle Preset Selections
  const handleSelectPreset = (presetDate: string, mode: "OTOMATIS" | "KUNCI_MANUAL") => {
    setKebijakanAkses(mode);
    if (mode === "KUNCI_MANUAL") {
      const todayStr = new Date().toISOString().split("T")[0];
      setBatasAkhir(todayStr);
    } else {
      setBatasAkhir(presetDate);
    }
  };

  // Handle Refresh / Reset
  const handleRefresh = () => {
    fetchCutoffData();
    triggerToast("Data formulir & log berhasil diperbarui.");
  };

  // Handle Save to API
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/config/cutoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          title: namaPeriode,
          startDate: tanggalMulai,
          cutoffDate: batasAkhir,
          kebijakanAkses: kebijakanAkses,
          message: "Maaf, periode pengisian dan pengunggahan data survei telah ditutup.",
        }),
      });

      const data = await res.json();
      if (data.success) {
        triggerToast("Konfigurasi batas waktu berhasil disimpan!");
        // Refresh logs from API
        fetchCutoffData();
      } else {
        triggerToast(data.error || "Gagal menyimpan konfigurasi!");
      }
    } catch (error) {
      console.error("Save error:", error);
      triggerToast("Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };


  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-700/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0 flex items-center justify-center border border-emerald-100/60">
            <CalendarClock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Pengaturan Batas Waktu & Periode Survei
              </h1>
              <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-slate-200/60">
                Cut-Off Date Engine
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-4xl">
              Konfigurasi batas akhir (&quot;cut-off date&quot;) penginputan capaian keolahragaan dan berkas bukti fisik atlet. Sistem akan otomatis mengunci akses 10 operator kabupaten/kota se-Kaltim menjadi <strong className="text-slate-800 font-semibold">Mode Baca Saja (Read-Only)</strong> setelah tenggat waktu berakhir.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          type="button"
          className="self-start md:self-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Status Pengisian Data */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              STATUS PENGISIAN DATA
            </span>
            <div
              className={`p-2.5 rounded-xl ${
                isLocked ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
          </div>
          <div>
            <h2
              className={`text-2xl font-bold ${
                isLocked ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {isLocked ? "Terkunci (Read-Only)" : "Terbuka & Aktif"}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isLocked
                ? "Akses penginputan data oleh 10 Kab/Kota telah ditutup. Sistem berada dalam mode baca saja."
                : "Operator 10 Kab/Kota dapat mendaftarkan responden, mengunggah capaian medali, dan melampirkan berkas bukti fisik."}
            </p>
          </div>
        </div>

        {/* Card 2: Tenggat Batas Akhir */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              TENGGAT BATAS AKHIR
            </span>
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {batasAkhir}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Pukul 23:59:59 WITA pada tanggal tersebut adalah batas toleransi terakhir penginputan dokumen.
            </p>
          </div>
        </div>

        {/* Card 3: Hitung Mundur Waktu */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              HITUNG MUNDUR WAKTU
            </span>
            <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span
                className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                  isLocked || daysRemaining <= 0
                    ? "bg-rose-100 text-rose-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {isLocked
                  ? "Akses Terkunci"
                  : daysRemaining > 0
                  ? `${daysRemaining} Hari Tersisa`
                  : "Waktu Habis"}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mencakup 10 daerah: Samarinda, Balikpapan, Bontang, Kukar, Kutim, Berau, PPU, Paser, Kubar, dan Mahulu.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Left Form (7 cols) / Right Enforcement & Logs (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-6">
          {/* Header Card Form */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Formulir Batas Waktu & Status Kunci
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ubah tanggal tenggat atau kunci manual sewaktu-waktu sesuai arahan Dispora Kaltim.
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200/80 shrink-0">
              PRD-2026
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Field: Nama Periode */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Nama / Judul Periode Evaluasi
              </label>
              <input
                type="text"
                value={namaPeriode}
                onChange={(e) => setNamaPeriode(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                placeholder="Masukkan judul periode evaluasi"
              />
            </div>

            {/* Field: Dates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Batas Akhir (Cut-Off Date)
                </label>
                <input
                  type="date"
                  value={batasAkhir}
                  onChange={(e) => setBatasAkhir(e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-400 text-emerald-950 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Presets Row */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pilihan Cepat Batas Tenggat:
              </label>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectPreset("2026-11-30", "OTOMATIS")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    batasAkhir === "2026-11-30" && kebijakanAkses === "OTOMATIS"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-semibold shadow-xs"
                      : "bg-emerald-50/60 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>30 November 2026 (Sesuai Rapat)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset("2026-12-31", "OTOMATIS")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    batasAkhir === "2026-12-31" && kebijakanAkses === "OTOMATIS"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-semibold shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>31 Desember 2026 (Akhir Tahun)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleKebijakanChange("KUNCI_MANUAL")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    kebijakanAkses === "KUNCI_MANUAL"
                      ? "bg-amber-100 text-amber-900 border-amber-400 font-semibold shadow-xs"
                      : "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Kunci Manual Sekarang</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleKebijakanChange("OTOMATIS")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    kebijakanAkses === "OTOMATIS"
                      ? "bg-slate-100 text-slate-800 border-slate-300 font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Buka Akses Pengisian</span>
                </button>
              </div>
            </div>

            {/* Policy Radio Cards */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-slate-800">
                Kebijakan Akses Operator 10 Kabupaten/Kota
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Radio Card 1: Akses Terbuka Otomatis */}
                <div
                  onClick={() => handleKebijakanChange("OTOMATIS")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    kebijakanAkses === "OTOMATIS"
                      ? "border-emerald-500 bg-emerald-50/40 shadow-xs"
                      : "border-slate-200/80 bg-slate-50/40 hover:border-slate-300"
                  }`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        kebijakanAkses === "OTOMATIS"
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {kebijakanAkses === "OTOMATIS" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Akses Terbuka Otomatis
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Operator dapat mengisi data hingga tanggal cut-off tiba ({batasAkhir}).
                    </p>
                  </div>
                </div>

                {/* Radio Card 2: Kunci Manual */}
                <div
                  onClick={() => handleKebijakanChange("KUNCI_MANUAL")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    kebijakanAkses === "KUNCI_MANUAL"
                      ? "border-rose-500 bg-rose-50/40 shadow-xs"
                      : "border-slate-200/80 bg-slate-50/40 hover:border-slate-300"
                  }`}
                >
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        kebijakanAkses === "KUNCI_MANUAL"
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-slate-400 bg-white"
                      }`}
                    >
                      {kebijakanAkses === "KUNCI_MANUAL" && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Kunci Manual (Read-Only)
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Langsung tutup pengisian sekarang juga, mengabaikan tanggal cut-off.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full bg-[#064e3b] hover:bg-[#04382a] text-white rounded-xl py-3.5 px-6 text-sm font-bold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Konfigurasi Batas Waktu</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Enforcement Info & Change History Logs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Enforcement Impact Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Dampak Penguncian Sistem (Enforcement)
              </h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Ketika sistem berada dalam status <strong className="text-slate-800 font-semibold">Terkunci</strong> (baik karena tanggal hari ini telah melewati cut-off date maupun dikunci manual oleh admin), seluruh request penulisan data dari operator akan ditolak dengan kode <span className="font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">HTTP 403 Forbidden</span>:
            </p>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                  <UserX className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    Pendaftaran Responden (KAT-01)
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tombol tambah responden dinonaktifkan di UI dan diblokir server.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    Impor Berkas Excel
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Unggah massal data capaian atlet ditolak otomatis.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    Unggah Bukti Fisik PDF
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Upload piagam/sertifikat (maks 1 MB) dikunci menjadi mode baca.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900">
                    Akses Khusus Admin Dispora
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Admin tetap dapat mengesahkan berkas, merekap medali, dan mencetak Berita Acara.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Change History Logs Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <History className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-bold text-slate-900">
                Riwayat Log Perubahan Periode
              </h2>
            </div>

            {logHistory.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 italic">
                  Belum ada catatan riwayat perubahan periode tercatat.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {logHistory.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>{log.timestamp}</span>
                      <span className="font-semibold text-emerald-700">{log.user.split(" ")[0]}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{log.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
