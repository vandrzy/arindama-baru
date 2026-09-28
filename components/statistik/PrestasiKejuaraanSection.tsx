import React from "react";
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
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

interface PrestasiKejuaraanSectionProps {
  kejuaraanData: any;
  hasCategoryData: (catKey: any) => boolean;
}

export default function PrestasiKejuaraanSection({ kejuaraanData, hasCategoryData }: PrestasiKejuaraanSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-1">
        <span className="text-xs font-semibold text-brand-text-secondary">Sumber Data</span>
        <div className="text-sm font-bold text-brand-primary">Indikator 8 - Keikutsertaan &amp; Prestasi Kejuaraan</div>
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
                    data={kejuaraanData?.sumberPendanaanStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ""}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {kejuaraanData?.sumberPendanaanStats?.map((_: any, index: number) => (
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
                <BarChart data={kejuaraanData?.tingkatKejuaraanStats || []}>
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
  );
}
