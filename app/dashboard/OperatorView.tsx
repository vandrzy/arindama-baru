"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  ShieldCheck,
  Database,
  ArrowRight,
  Loader2,
  Users,
  Trophy,
  Clock,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";

interface DashboardStats {
  totalResponden: number;
  totalDataInput: number;
  totalBerkasPdf: number;
  totalDisetujui: number;
  menungguReview: number;
  recentSubmissions: any[];
}

export function OperatorView() {
  const { currentUser } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/operator");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const wilayah = currentUser?.kabupatenKota || currentUser?.instansi || "Kalimantan Timur";

  return (
    <div className="space-y-6">
      {/* HEADER KONTEN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">WORKSPACE KERJA OPERATOR KECAMATAN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pemantauan &amp; Penginputan Wilayah {wilayah}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Monitoring kuota responden, unggah berkas kolektif Excel, dan verifikasi sertifikat fisik
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Link href="/kuesioner" className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl h-11 px-6 shadow-md shadow-emerald-900/10"
            >
              <span className="text-lg leading-none">+</span> Unggah Excel Kategori
            </Button>
          </Link>
        </div>
      </div>

      {/* STATISTIK UTAMA (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Kuota Responden */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm bg-white hover:border-emerald-200 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-slate-600">Kuota Responden</h3>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalResponden || 0} <span className="text-lg font-bold text-slate-500">Orang</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">Total Terdaftar</span>
          </div>
        </Card>

        {/* Card 2: Kegiatan Terinput */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm bg-white hover:border-blue-200 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-slate-600">Kegiatan Terinput</h3>
              <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                <Trophy className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalDataInput || 0} <span className="text-lg font-bold text-slate-500">Entri</span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-1">Kategori Olahraga Wilayah</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 truncate max-w-full" title={wilayah}>{wilayah}</span>
          </div>
        </Card>

        {/* Card 3: Berkas Terverifikasi Sah */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm bg-white hover:border-emerald-200 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-slate-600">Berkas Terverifikasi Sah</h3>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalDisetujui || 0} <span className="text-lg font-bold text-slate-500">Berkas</span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-1">Tervalidasi Tim Dispora Kaltim</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">Dokumen Sah & Bersegel</span>
          </div>
        </Card>

        {/* Card 4: Menunggu Verifikasi */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm bg-white hover:border-amber-200 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-slate-600">Menunggu Verifikasi</h3>
              <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {stats?.menungguReview || 0} <span className="text-lg font-bold text-amber-600/70">Berkas</span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-1">Perlu review verifikator dinas</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600">Dalam antrean verifikasi</span>
          </div>
        </Card>
      </div>

      {/* TABEL SUBMISI TERBARU */}
      <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Daftar Submisi Wilayah {wilayah}</h2>
            <p className="text-[13px] font-medium text-slate-500 mt-1">Submisi capaian kegiatan, berkas piagam/sertifikat, dan status pengesahan dari Dispora Provinsi</p>
          </div>
          <Link href="/kuesioner">
            <Button className="h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm">
              Buka Detail Kategori
            </Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-xs uppercase font-extrabold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">NAMA KEGIATAN & CABOR</th>
                <th className="px-6 py-4">PESERTA / ATLET</th>
                <th className="px-6 py-4">TINGKAT</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-center rounded-tr-2xl">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((rec: any, idx: number) => {
                  const statusLabel = rec.status || "Menunggu Validasi";
                  const isSah = statusLabel === "Sah & Terverifikasi" || statusLabel === "Sah" || statusLabel === "Disetujui";
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors bg-white">
                      <td className="px-6 py-4 align-top">
                        <div className="font-extrabold text-slate-900 text-sm max-w-[300px] truncate" title={rec.namaKegiatan}>
                          {rec.namaKegiatan || "-"}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{rec.cabangOlahraga || "-"}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-slate-800">{rec.responden?.nama || "-"}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-slate-600">{rec.tingkatPenyelenggaraan || "-"}</div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {isSah ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Terverifikasi Sah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Menunggu Validasi
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-center">
                        <Link href="/kuesioner">
                          <Button size="sm" variant="outline" className="h-8 px-4 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 transition-colors">
                            Buka
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 bg-white">
                    Belum ada data submisi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
