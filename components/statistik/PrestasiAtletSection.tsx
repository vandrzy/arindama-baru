import React from "react";
import { Trophy, Filter, Award, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
import EmptyDataChartHint from "./EmptyDataChartHint";

const MEDAL_COLORS = {
  Emas: "#F59E0B",
  Perak: "#94A3B8",
  Perunggu: "#D97706",
};

interface PrestasiAtletSectionProps {
  selectedAtletIndicator: string;
  setSelectedAtletIndicator: (val: string) => void;
  filteredAtletList: any[];
  rawAtletList: any[];
  activeAtletCalculatedStats: any;
  hasCategoryData: (catKey: any) => boolean;
}

export default function PrestasiAtletSection({
  selectedAtletIndicator,
  setSelectedAtletIndicator,
  filteredAtletList,
  rawAtletList,
  activeAtletCalculatedStats,
  hasCategoryData,
}: PrestasiAtletSectionProps) {
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
              * Total perolehan skor daerah dihitung otomatis: Total {activeAtletCalculatedStats.totalBobotScore} Poin.
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

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">
                    {rawAtletList.length}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase mt-1">
                    TOTAL REKAM
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs">
                <span className="bg-sky-50 text-sky-800 font-bold px-3 py-1 rounded-lg border border-sky-100">
                  Atlet (Indikator 6): {atletPercent}%
                </span>
                <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-lg border border-emerald-100">
                  Pelajar (Indikator 1): {pelajarPercent}%
                </span>
              </div>

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

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-gray-700 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> Medali Emas
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#94A3B8]" /> Medali Perak ({activeAtletCalculatedStats.atletChartData.reduce((acc: number, curr: any) => acc + curr.Perak, 0)})
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#D97706]" /> Medali Perunggu
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#0284C7]" /> Partisipan / Non-Medali ({activeAtletCalculatedStats.atletChartData.reduce((acc: number, curr: any) => acc + curr.Partisipasi, 0)})
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
}
