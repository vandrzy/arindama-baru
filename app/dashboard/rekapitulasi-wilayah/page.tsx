"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/app-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  FileCheck, 
  Users, 
  Medal, 
  Trophy, 
  Loader2, 
  Download, 
  Printer,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RekapitulasiWilayahPage() {
  const { currentUser, isLoading: isSessionLoading } = useApp();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Filters
  const [selectedTingkat, setSelectedTingkat] = useState("Tingkat 2");
  const [selectedPilar, setSelectedPilar] = useState("Semua");

  const pilarOptions = ["Semua", "Prestasi (KONI)", "Disabilitas (NPC)", "Masyarakat (KORMI)", "Dispora"];
  const tingkatOptions = ["Tingkat 2", "Tingkat 3"];

  useEffect(() => {
    if (!isSessionLoading && currentUser?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [currentUser, isSessionLoading, router]);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchData();
    }
  }, [selectedTingkat, selectedPilar, currentUser]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/rekapitulasi-wilayah?tingkat=${selectedTingkat}&pilar=${selectedPilar}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        console.error("Gagal mengambil data rekapitulasi:", json.error);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSessionLoading || !currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  // Calculate some aggregate values for cards
  const pctVerified = data?.totalDataMasuk > 0 
    ? ((data.totalDataTerverifikasi / data.totalDataMasuk) * 100).toFixed(1) 
    : 0;

  const pemimpin = data?.peringkatWilayah?.[0];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">


      {/* CARDS RINGKASAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Validasi Berkas */}
        <Card className="p-5 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Status Validasi Berkas</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {data ? data.totalDataMasuk : 0} <span className="text-sm text-slate-500 font-medium">Dokumen</span>
            </div>
            <div className="text-sm font-bold text-emerald-600 mt-1">
              {pctVerified}% Terverifikasi Sah
            </div>
          </div>
        </Card>

        {/* Total Medali Sah */}
        <Card className="p-5 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <Medal className="w-4 h-4" />
            <span>Total Medali Sah</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {data ? data.medaliSah?.total : 0} <span className="text-sm text-slate-500 font-medium">Medali</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-1.5 flex items-center gap-1.5">
              <span>{data?.medaliSah?.emas || 0} Emas</span>
              <span>•</span>
              <span>{data?.medaliSah?.perak || 0} Perak</span>
              <span>•</span>
              <span>{data?.medaliSah?.perunggu || 0} Perunggu</span>
            </div>
          </div>
        </Card>

        {/* Kepatuhan Kuota Responden */}
        <Card className="p-5 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Kepatuhan Kuota Responden</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900">
              {data ? data.totalResponden : 0} <span className="text-sm text-slate-500 font-medium">Total</span>
            </div>
            <div className="text-sm font-bold text-blue-600 mt-1">
              Data Responden Saat Ini
            </div>
          </div>
        </Card>

        {/* Pemimpin Peringkat */}
        <Card className="p-5 border border-slate-200 shadow-sm rounded-3xl bg-white flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Pemimpin Peringkat</span>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate" title={pemimpin?.namaWilayah || "-"}>
              {pemimpin ? pemimpin.namaWilayah : "-"}
            </div>
            <div className="text-sm font-bold text-slate-500 mt-1">
              Skor IPO: <span className="text-emerald-700">{pemimpin ? Math.round(pemimpin.skor) : "0"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER BERJENJANG */}
      <Card className="p-6 border border-slate-200 shadow-sm rounded-3xl bg-white mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Filter Berjenjang</h3>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Pilih Skala Wilayah &amp; Kategori Olahraga</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-slate-50 p-1.5 rounded-full border border-slate-100 overflow-x-auto">
            {pilarOptions.map(opt => {
              const isSelected = selectedPilar === opt;
              let icon = null;
              if (opt === "Prestasi (KONI)") icon = <Trophy className="w-4 h-4" />;
              else if (opt === "Disabilitas (NPC)") icon = <Activity className="w-4 h-4" />;
              else if (opt === "Masyarakat (KORMI)") icon = <Users className="w-4 h-4" />;
              
              return (
                <button
                  key={opt}
                  onClick={() => setSelectedPilar(opt)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all whitespace-nowrap ${
                    isSelected
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-5 rounded-2xl border transition-all relative overflow-hidden bg-slate-50/50 border-slate-200 hover:bg-slate-100/50`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-extrabold text-slate-900 text-sm truncate max-w-[70%]" title={pemimpin ? `${pemimpin.namaWilayah} • Juara 1` : "Kabupaten / Kota"}>
                {pemimpin ? `${pemimpin.namaWilayah} • Juara 1` : "Kabupaten / Kota"}
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-200 text-slate-600`}>
                10 Kab / Kota
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3 h-[36px]">
              Validasi berkas oleh tim daerah dan verifikasi piagam kejuaraan.
            </p>
            <div className={`text-xs font-bold text-slate-700`}>
              Indeks: {pemimpin ? Math.round(pemimpin.skor) : "0"} • Kategori Tinggi
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all relative overflow-hidden bg-slate-50/50 border-slate-200 hover:bg-slate-100/50`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-extrabold text-slate-900 text-sm">
                Provinsi Kalimantan Timur
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-200 text-slate-600`}>
                1 Provinsi
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-3 h-[36px]">
              Agregasi menyeluruh 9 kategori untuk perumusan kebijakan pembangunan olahraga.
            </p>
            <div className={`text-xs font-bold text-slate-700`}>
              Indeks Gabungan: {pemimpin ? Math.round(pemimpin.skor * 0.95) : "0"} • Kategori Tinggi
            </div>
          </div>
        </div>
      </Card>

      {/* TABEL PERINGKAT INDEKS */}
      <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Tabel Peringkat Indeks IPO Antar-Wilayah
          </h2>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
              <p className="text-sm font-medium text-slate-500">Memuat data peringkat...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  <th className="py-4 px-6 w-16">Peringkat</th>
                  <th className="py-4 px-6">Kabupaten / Kota</th>
                  <th className="py-4 px-6 text-center">Kecamatan Selesai</th>
                  <th className="py-4 px-6 text-center">Total Responden</th>
                  <th className="py-4 px-6 text-center">Capaian Medali</th>
                  <th className="py-4 px-6 text-center">Skor Indeks IPO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data?.peringkatWilayah?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Tidak ada data untuk filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  data?.peringkatWilayah?.map((wilayah: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-extrabold text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{wilayah.namaWilayah}</div>
                      </td>
                      <td className="py-4 px-6 text-center text-slate-500 font-medium">
                        -
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {wilayah.jumlahResponden}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {wilayah.jumlahMedaliSah} Medali
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-extrabold text-slate-900">
                          {Math.round(wilayah.skor)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
