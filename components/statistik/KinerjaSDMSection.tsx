import React from "react";
import { Filter, PieChart as PieChartIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import EmptyDataChartHint from "./EmptyDataChartHint";

const COLOR_PALETTE = [
  "#0F766E",
  "#0284C7",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#10B981",
  "#EC4899",
  "#6366F1",
];

interface KinerjaSDMSectionProps {
  selectedKinerjaIndicator: string;
  setSelectedKinerjaIndicator: (val: string) => void;
  filteredKinerjaList: any[];
  activeKinerjaJenjangStats: any[];
  activeKinerjaPendanaanStats: any[];
  hasCategoryData: (catKey: any) => boolean;
}

export default function KinerjaSDMSection({
  selectedKinerjaIndicator,
  setSelectedKinerjaIndicator,
  filteredKinerjaList,
  activeKinerjaJenjangStats,
  activeKinerjaPendanaanStats,
  hasCategoryData,
}: KinerjaSDMSectionProps) {
  return (
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
  );
}
