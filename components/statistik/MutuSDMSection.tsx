import React from "react";
import { PieChart as PieChartIcon } from "lucide-react";
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

interface MutuSDMSectionProps {
  mutuData: any;
  hasCategoryData: (catKey: any) => boolean;
}

export default function MutuSDMSection({ mutuData, hasCategoryData }: MutuSDMSectionProps) {
  return (
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
            {mutuData?.totalRecords || 0} <span className="text-xs font-normal text-gray-500">Kegiatan</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-brand-text-secondary">Tingkat Pelatihan Utama</span>
          <div className="text-sm font-bold text-brand-text">
            {mutuData?.jenjangPenugasanStats?.find((j: any) => j.value > 0)?.name || "Provinsi / Nasional"}
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
                    data={mutuData?.jenjangPenugasanStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {mutuData?.jenjangPenugasanStats?.map((_: any, index: number) => (
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
                    data={mutuData?.sumberPendanaanStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {mutuData?.sumberPendanaanStats?.map((_: any, index: number) => (
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
  );
}
