"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Medal,
  FileCheck,
  Loader2,
  Trophy,
  Activity,
  BarChart3,
  ExternalLink
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

  const pilarOptions = ["Semua", "Prestasi (KONI)", "Disabilitas (NPC)", "Masyarakat (KORMI)", "Dispora"];

  useEffect(() => {
    fetchData();
  }, [selectedPilar]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?pilar=${selectedPilar}`);
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

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* 1. HEADER */}
      <div className="flex flex-col gap-5 mb-6">
        <div>
          <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">TINGKAT PROVINSI KALIMANTAN TIMUR</h3>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Overview Indeks IPO Daerah</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Sistem evaluasi komprehensif 9 Kategori Keolahragaan tingkat Kabupaten/Kota &amp; Provinsi
          </p>
        </div>

        {/* Filter Pilar */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100 overflow-x-auto self-start">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-all whitespace-nowrap ${isSelected
                  ? "bg-[#0f172a] text-white shadow-sm"
                  : "bg-transparent text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                  }`}
              >
                {icon}
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. EMPAT KARTU RINGKASAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Indeks Komposit IPO */}
        <Card className="p-5 border-none shadow-md rounded-3xl bg-emerald-900 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 transform translate-x-4 pointer-events-none" />
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-200">
            <BarChart3 className="w-4 h-4" />
            <span>Indeks Komposit IPO</span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-end gap-3">
              <div className="text-4xl font-extrabold tracking-tight">
                {kompositSkor}
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase border ${kompositStatus.color}`}>
                {kompositStatus.label}
              </span>
            </div>
            <div className="text-sm font-medium text-emerald-100 mt-2">
              Total Akumulasi Keseluruhan Skor
            </div>
          </div>
        </Card>

        {/* Responden Terdata */}
        <Card className="p-5 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Responden Terdata</span>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold text-slate-900">
              {data?.totalResponden || 0}
            </div>
            <div className="text-sm font-medium text-slate-500 mt-2">
              Total Seluruh Responden
            </div>
          </div>
        </Card>

        {/* Statistik Capaian Medali */}
        <Card className="p-5 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col justify-between">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <Medal className="w-4 h-4" />
            <span>Statistik Capaian Medali</span>
          </div>
          <div className="mt-4">
            <div className="text-4xl font-extrabold text-slate-900">
              {data?.medaliSah?.total || 0}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>{data?.medaliSah?.emas || 0} Emas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300"></span>{data?.medaliSah?.perak || 0} Perak</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-600"></span>{data?.medaliSah?.perunggu || 0} Perunggu</span>
            </div>
          </div>
        </Card>

        {/* Antrean Validasi Berkas */}
        <Card className="p-5 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col justify-between relative">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Antrean Validasi Berkas</span>
          </div>
          <div className="mt-4 relative">
            <div className="text-4xl font-extrabold text-slate-900">
              {data?.antreanValidasi || 0} <span className="text-sm font-medium text-slate-500 ml-1">Menunggu Review</span>
            </div>
            <div className="absolute right-0 bottom-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
              {data?.totalDataTerverifikasi || 0} Terverifikasi
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. KLASIFIKASI 4 PILAR KEOLAHRAGAAN */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Klasifikasi 4 Pilar Keolahragaan
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Pembagian skor indeks berdasarkan pilar keolahragaan
              </p>
            </div>

            <div className="space-y-5 flex-1">
              {[
                { id: "KONI", title: "Olahraga Prestasi", subtitle: "KONI / Cabor Resmi", skor: data?.pilarScores?.KONI || 0, icon: <Trophy className="w-5 h-5" />, iconBg: "bg-emerald-100 text-emerald-600" },
                { id: "KORMI", title: "Olahraga Masyarakat", subtitle: "KORMI / Kebugaran & Tradisional", skor: data?.pilarScores?.KORMI || 0, icon: <Users className="w-5 h-5" />, iconBg: "bg-amber-100 text-amber-600" },
                { id: "NPC", title: "Olahraga Disabilitas", subtitle: "NPC (National Paralympic Committee)", skor: data?.pilarScores?.NPC || 0, icon: <Activity className="w-5 h-5" />, iconBg: "bg-blue-100 text-blue-600" },
                { id: "Dispora", title: "Dispora", subtitle: "Dinas Pemuda dan Olahraga", skor: data?.pilarScores?.Dispora || 0, icon: <FileCheck className="w-5 h-5" />, iconBg: "bg-slate-100 text-slate-600" }
              ].map((pilar, index) => {
                const status = getKategoriFromSkor(pilar.skor);
                return (
                  <div key={pilar.id} className={`flex items-center justify-between pb-5 ${index !== 3 ? 'border-b border-slate-100' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${pilar.iconBg}`}>
                        {pilar.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{pilar.title}</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">{pilar.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-slate-900 mb-1">{pilar.skor}</div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-5 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                STANDAR KATEGORI EVALUASI IPO
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Tinggi ({'>'} 600)
                </span>
                <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200 text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Menengah ({'>'} 400)
                </span>
                <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200 text-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  Rendah ({'<='} 400)
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* 5. GRAFIK REKAPITULASI INDEKS BERJENJANG */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-slate-200 shadow-sm rounded-3xl bg-white h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">REKAPITULASI INDEKS BERJENJANG</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">{Math.round((data?.totalKomposit || 0) / 10)}</span>
                  <span className="text-sm font-medium text-slate-500">/10 Kab/Kota Kaltim</span>
                </div>
              </div>
              <div className="flex items-center bg-slate-50 p-1.5 rounded-full border border-slate-100">
                <Badge variant="neutral" className="bg-[#0f172a] text-white hover:bg-[#0f172a] border-none px-4 py-1.5 text-xs rounded-full">
                  Kabupaten/Kota
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mb-6">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              Arahkan kursor pada bar untuk rincian wilayah
            </div>

            <div className="flex-1 min-h-[250px]">
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
                          <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-xl">
                            <div className="text-xs font-bold text-slate-500 mb-1">{label}</div>
                            <div className="text-lg font-extrabold text-slate-900">Skor: {skor}</div>
                            <div className={`inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${status.color}`}>
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
                    maxBarSize={60}
                    background={{ fill: '#f8fafc', radius: 12 }}
                  >
                    <LabelList dataKey="skor" position="top" style={{ fontSize: '11px', fontWeight: 'bold', fill: '#475569' }} offset={10} />
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

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Capaian Tertinggi: {data?.chartWilayah?.[0]?.namaWilayah || "-"} ({data?.chartWilayah?.[0]?.skor || 0}) • Berau &amp; Paser terverifikasi
              </div>
              <Link href="/dashboard/rekapitulasi-wilayah" className="text-[11px] font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                Buka Tabel Rekapitulasi Berjenjang &rarr;
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* 6. TABEL SUBMISI & VALIDASI BERKAS TERKINI */}
      <div className="space-y-4">
        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Submisi &amp; Validasi Berkas Terkini
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Daftar entri kegiatan kejuaraan, sertifikat pendukung, dan status keabsahan dokumen</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input type="text" placeholder="Cari kegiatan, cabor, peserta..." className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-600 bg-white shadow-sm placeholder:text-slate-400" />
              </div>
              <Link href="/dashboard/bobot-dinamis" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                Atur Bobot
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="py-4 px-6 pl-8">Nama Kegiatan & Cabang Olahraga</th>
                  <th className="py-4 px-6">Nama Peserta / Responden</th>
                  <th className="py-4 px-6">Tingkat</th>
                  <th className="py-4 px-6">Capaian Medali</th>
                  <th className="py-4 px-6">Sumber Dana</th>
                  <th className="py-4 px-6 text-center pr-8">Status Berkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {!data?.recentSubmissions || data.recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Belum ada data submisi terkini untuk Indikator 1 & 6.
                    </td>
                  </tr>
                ) : (
                  data.recentSubmissions.slice(0, 10).map((sub: any, idx: number) => {
                    let statusBadge = (
                      <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {sub.status || "Belum Upload"}
                      </span>
                    );

                    const statusLower = (sub.status || "").toLowerCase();
                    if (["sah", "sah & terverifikasi", "disetujui", "terunggah"].includes(statusLower)) {
                      statusBadge = (
                        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Terunggah
                        </span>
                      );
                    } else if (["menunggu validasi", "menunggu review", "belum upload", "proses"].includes(statusLower)) {
                      statusBadge = (
                        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Belum Upload
                        </span>
                      );
                    } else if (["perlu revisi", "revisi", "ditolak"].includes(statusLower)) {
                      statusBadge = (
                        <span className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Ditolak
                        </span>
                      );
                    }

                    return (
                      <tr key={sub.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-6 pl-8">
                          <div className="font-bold text-slate-900">{sub.namaKegiatan || sub.kejuaraan || "-"}</div>
                          <div className="text-[11px] font-semibold text-slate-400 mt-0.5">Kategori {sub.kategori || "3"} &bull; {sub.cabangOlahraga || sub.cabor || "Olahraga"}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-700">{sub.peserta || sub.responden || "-"}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-600">
                            {sub.tingkat || "Nasional"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-amber-700 font-extrabold">
                          {sub.medali || "Emas"}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600 font-semibold">
                          {sub.sumberDana || "APBD"}
                        </td>
                        <td className="py-4 px-6 text-center pr-8">
                          {statusBadge}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/30">
            <Link href="/kuesioner" className="text-[11px] font-bold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              Buka Seluruh Berkas & Bukti Sah &rarr;
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
