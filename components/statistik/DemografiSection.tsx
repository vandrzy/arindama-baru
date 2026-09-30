import React from "react";
import { Users, PieChart as PieChartIcon, TrendingUp, BarChart3 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
import EmptyDataChartHint from "./EmptyDataChartHint";

interface DemografiSectionProps {
  demografiData: any;
  hasCategoryData: (catKey: any) => boolean;
}

export default function DemografiSection({ demografiData, hasCategoryData }: DemografiSectionProps) {
  const totalJk = (demografiData?.jenisKelaminStats?.[0]?.value || 0) + (demografiData?.jenisKelaminStats?.[1]?.value || 0);
  const maleCount = demografiData?.jenisKelaminStats?.[0]?.value || 0;
  const femaleCount = demografiData?.jenisKelaminStats?.[1]?.value || 0;
  const malePercent = totalJk > 0 ? Math.round((maleCount / totalJk) * 100) : 0;
  const femalePercent = totalJk > 0 ? Math.round((femaleCount / totalJk) * 100) : 0;

  const dominantAgeObj = (demografiData?.umurStats || []).reduce((max: any, item: any) => (item.value > (max?.value || -1) ? item : max), null);
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
                {demografiData?.totalOperator || 0}
              </span>
              <span className="text-sm font-semibold text-gray-700">Operator</span>
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
              Proporsi Jenis Kelamin Operator
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
                Sebaran Kelompok Usia Operator
              </h3>
            </div>

            {hasCategoryData("demografi") ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={demografiData?.umurStats || []}
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
                      name="Jumlah Operator"
                      fill="#003820"
                      radius={[6, 6, 0, 0]}
                      barSize={44}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyDataChartHint title="Belum Ada Data Usia Operator" />
            )}
          </div>

          {/* Footer Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs">
            <span className="text-gray-600 font-medium">
              Rentang Usia Dominan: <strong className="text-emerald-950 font-bold">{dominantAgeLabel}</strong>
            </span>
            <span className="bg-blue-100/80 text-blue-800 font-bold px-3 py-1 rounded-full text-xs border border-blue-200/60 shrink-0 self-start sm:self-auto">
              Akumulasi: {demografiData?.totalOperator || 0} Data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
