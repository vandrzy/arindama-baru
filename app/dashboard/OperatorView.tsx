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
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";

interface DashboardStats {
  totalDataInput: number;
  totalBerkasPdf: number;
  totalDisetujui: number;
  menungguReview: number;
  indikatorStats: { id: number; name: string; uploaded: number; target: number }[];
  status8Indikator: { code: string; title: string; count: number; sah: number }[];
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

  const kelulusanPercent = stats?.totalDataInput && stats.totalDataInput > 0
    ? Math.round((stats.totalDisetujui / stats.totalDataInput) * 100)
    : 0;
  
  const kelengkapanPdfPercent = stats?.totalDataInput && stats.totalDataInput > 0
    ? Math.round((stats.totalBerkasPdf / stats.totalDataInput) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* HEADER KONTEN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">WORKSPACE KERJA OPERATOR</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pemantauan &amp; Penginputan Data Operator
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Monitoring data entri kegiatan, unggah berkas, dan verifikasi dokumen fisik
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <a
            href="/templates/Semua_Template_Kuesioner.zip"
            download="Semua_Template_Kuesioner.zip"
            className="w-full sm:w-auto"
          >
            <Button
              variant="outline"
              className="w-full sm:w-auto gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-bold rounded-xl h-11"
            >
              <Download className="w-4 h-4" />
              Unduh Template Excel
            </Button>
          </a>
        </div>
      </div>

      {/* STATISTIK UTAMA (TOP CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Data Input */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm bg-white hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-600">Total Data Input</h3>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mb-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalDataInput || 0} <span className="text-lg font-bold text-slate-500">Entri</span>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-1">Data Anda yang terinput</p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600">Operator: {currentUser?.nama}</span>
          </div>
        </Card>

        {/* Card 2: Bukti Fisik PDF */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm bg-white hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-slate-600">Bukti Fisik PDF</h3>
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mb-4">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalBerkasPdf || 0} <span className="text-lg font-bold text-slate-500">Berkas</span>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-1">Dari {stats?.totalDataInput || 0} Entri Kegiatan</p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600">{kelengkapanPdfPercent}% Kelengkapan Dokumen</span>
          </div>
        </Card>

        {/* Card 3: Status Validasi */}
        <Card className="p-6 rounded-3xl border border-slate-200 shadow-sm bg-white hover:border-emerald-200 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-slate-600">Status Validasi</h3>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mb-4">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats?.totalDisetujui || 0} <span className="text-lg font-bold text-emerald-600">Disetujui</span>
              </div>
              <p className="text-xs font-medium text-slate-400 mt-1">{stats?.menungguReview || 0} Menunggu Review Dispora</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600">Kelulusan: {kelulusanPercent}%</span>
            <Link href="/kuesioner" className="text-[11px] font-bold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1">
              Lihat Berkas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* BOTTOM SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Total Berkas Validasi per Indikator */}
        <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Total Berkas Validasi per Indikator</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Monitoring kelengkapan berkas fisik</p>
            </div>
            <Link href="/kuesioner" className="text-[11px] font-bold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1">
              Lihat Semua &rarr;
            </Link>
          </div>
          <div className="p-6 flex-1">
            <div className="space-y-4">
              {stats?.indikatorStats?.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.uploaded >= item.target ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-900">{item.uploaded} <span className="text-slate-400 font-medium">/ {item.target}</span></span>
                    {item.uploaded >= item.target ? (
                      <span className="px-2 py-1 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700">Lengkap</span>
                    ) : (
                      <span className="px-2 py-1 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-700">Kurang {Math.max(0, item.target - item.uploaded)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* B. Status Input 8 Indikator */}
        <Card className="rounded-3xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Status Input 8 Indikator</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Data terverifikasi berdasarkan template form</p>
            </div>
            <Link href="/kuesioner" className="text-[11px] font-bold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1">
              Semua Kategori &rarr;
            </Link>
          </div>
          <div className="p-6 bg-slate-50/30 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats?.status8Indikator?.map((ind, i) => {
                const isSuccess = ind.sah > 0 && ind.sah === ind.count;
                const percent = ind.count > 0 ? Math.round((ind.sah / ind.count) * 100) : 0;
                
                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group">
                    <div className="text-[10px] font-bold text-slate-400 mb-1">{ind.code}</div>
                    <h4 className="text-xs font-extrabold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">{ind.title}</h4>
                    <div className={`text-[11px] font-semibold ${isSuccess ? 'text-emerald-600' : (ind.sah > 0 ? 'text-amber-600' : 'text-slate-500')}`}>
                      {ind.count} Terdata <span className="font-bold opacity-80">{ind.count > 0 ? `(${percent}% Sah)` : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
