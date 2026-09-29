"use client";

import React from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_TEMPLATES, FLOW_STEPS } from "@/lib/constants/ui-data";
import { AdminView } from "./AdminView";
import {
  FileText,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  FolderArchive,
  LayoutDashboard,
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser } = useApp();

  if (currentUser?.role === "ADMIN") {
    return <AdminView />;
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-[#0a482d] to-[#073622] text-white p-6 sm:p-10 lg:p-12 shadow-elevated border border-emerald-700/40">
        {/* Stadium lines accent */}
        <div className="absolute top-0 right-0 w-80 h-full border-l border-emerald-700/20 pointer-events-none hidden md:block" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-emerald-100 mb-4 sm:mb-6 shadow-sm">
            <BrandLogo className="w-4 h-4" />
            <span>WEBSITE RESMI BIDANG KEOLAHRAGAAN DAERAH</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Selamat datang kembali,{" "}
            <span className="text-brand-accent drop-shadow-sm">
              {currentUser?.nama || "Responden"}
            </span>
            !
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-8 max-w-2xl">
            Website resmi untuk mengumpulkan data akurat mengenai kejuaraan olahraga,
            peningkatan mutu pelatih &amp; wasit berlisensi, atlet berprestasi.
          </p>

          {/* Bottom Feature Strip inside Hero */}
          <div className="pt-6 border-t border-emerald-700/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-emerald-950/40 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/30">
              <div className="p-2 rounded-xl bg-emerald-800/50 text-emerald-300 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-snug">8 Indikator Evaluasi</h4>
                <p className="text-[11px] text-emerald-200/70">Parameter standar nasional</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-950/40 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/30">
              <div className="p-2 rounded-xl bg-emerald-800/50 text-emerald-300 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-snug">Format Standar .XLSX</h4>
                <p className="text-[11px] text-emerald-200/70">Kompatibel Excel &amp; WPS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-950/40 backdrop-blur-sm p-3 rounded-2xl border border-emerald-700/30">
              <div className="p-2 rounded-xl bg-emerald-800/50 text-emerald-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-snug">Validasi Dokumen Digital</h4>
                <p className="text-[11px] text-emerald-200/70">Verifikasi SK &amp; Sertifikat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Section Alur Pengisian Kuesioner */}
      <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-card">
        <div className="mb-8">
          <Badge variant="neutral" className="mb-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-200/80 rounded-full px-3 py-1 shadow-none">
            PANDUAN RESPONDEN
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text tracking-tight">
            Alur Pengisian Kuesioner
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
            6 tahapan mudah untuk menyelesaikan pengumpulan data keolahragaan daerah secara sistematis dan terverifikasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FLOW_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-brand-surface/40 rounded-2xl p-5 border border-gray-200/70 hover:border-emerald-400/80 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-extrabold flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
                      {item.step}
                    </span>
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-200">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-brand-text mb-2 group-hover:text-brand-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-4">
                  <span className="text-[11px] font-medium text-gray-400">
                    {item.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Section Unduh Template Kuesioner Excel */}
      <section id="templates" className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-card scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <Badge variant="neutral" className="mb-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-200/80 rounded-full px-3 py-1 shadow-none">
              FORMAT OFFLINE (.XLSX)
            </Badge>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text tracking-tight">
              Unduh Template Kuesioner Excel
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
              Unduh format spreadsheet Excel resmi untuk pengisian data kuesioner secara offline.
            </p>
          </div>

          <a
            href="/templates/Semua_Template_Kuesioner.zip"
            download="Semua_Template_Kuesioner.zip"
            className="shrink-0"
          >
            <Button
              variant="gold"
              size="md"
              className="w-full sm:w-auto shadow-sm hover:scale-[1.02] transition-transform gap-2 font-bold"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Unduh Semua Template (ZIP)</span>
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SURVEY_TEMPLATES.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:border-emerald-400/80 hover:bg-emerald-50/20 transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wider uppercase bg-emerald-100/90 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                    .xlsx
                  </span>
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-brand-text mb-1.5 leading-snug group-hover:text-brand-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-brand-text-secondary leading-relaxed mb-4 line-clamp-2">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 font-medium truncate max-w-[150px]" title={item.file}>
                  {item.file}
                </span>
                <a
                  href={`/templates/${encodeURIComponent(item.file)}`}
                  download={item.file}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
                >
                  <span>Unduh Template</span>
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
