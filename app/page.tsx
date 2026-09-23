"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import {
  FileText,
  UserCheck,
  ListOrdered,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Award,
  ChevronRight,
  FileSpreadsheet,
  Download,
} from "lucide-react";

const SURVEY_TEMPLATES = [
  {
    id: 1,
    name: "IdentitasResponden_Fixed.xlsx",
    file: "IdentitasResponden_Fixed.xlsx",
  },
  {
    id: 2,
    name: "Indikator 1_Kejuaraan Pelajar Tingkat Nasional dan Internasional.xlsx",
    file: "Indikator 1_Kejuaraan Pelajar Tingkat Nasional dan Internasional.xlsx",
  },
  {
    id: 3,
    name: "Indikator 2_Peningkatan Mutu SDM Olahraga.xlsx",
    file: "Indikator 2_Peningkatan Mutu SDM Olahraga.xlsx",
  },
  {
    id: 4,
    name: "Indikator 3_Pelatih Cabor Membawa Tim Tingkat Nasional Internasional.xlsx",
    file: "Indikator 3_Pelatih Cabor Membawa Tim Tingkat Nasional Internasional.xlsx",
  },
  {
    id: 5,
    name: "Indikator 4_ Wasit Cabang Olahraga Masuk dalam Wasit Nasional Internasional.xlsx",
    file: "Indikator 4_ Wasit Cabang Olahraga Masuk dalam Wasit Nasional Internasional.xlsx",
  },
  {
    id: 6,
    name: "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional.xlsx",
    file: "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional.xlsx",
  },
  {
    id: 7,
    name: "Indikator 6_Atlet Cabang Olahraga Mewakili Tim Nasional Internasional.xlsx",
    file: "Indikator 6_Atlet Cabang Olahraga Mewakili Tim Nasional Internasional.xlsx",
  },
  {
    id: 8,
    name: "Indikator 7_Penyelenggaraan Event Olahraga Nasional Internasional.xlsx",
    file: "Indikator 7_Penyelenggaraan Event Olahraga Nasional Internasional.xlsx",
  },
  {
    id: 9,
    name: "Indikator 8_Prestasi Event Olahraga Masyarakat Tingkat Nasional.xlsx",
    file: "Indikator 8_Prestasi Event Olahraga Masyarakat Tingkat Nasional.xlsx",
  },
];

export default function HomePage() {
  const { role, setRole, submissions } = useApp();

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero Section matching arindama.jpeg */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-[#0a482d] to-[#073622] text-white p-6 sm:p-10 lg:p-12 shadow-elevated border border-emerald-700/40">
        {/* Clean athletic stadium lines accent */}
        <div className="absolute top-0 right-0 w-80 h-full border-l border-emerald-700/20 pointer-events-none hidden md:block" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 px-3.5 py-1.5 rounded-full border border-emerald-700/50 text-xs font-semibold text-emerald-200 mb-4 sm:mb-6">
            <BrandLogo className="w-4 h-4" />
            <span>KUESIONER RESMI BIDANG KEOLAHRAGAAN DAERAH</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
            ARINDAMA <span className="text-brand-accent">SPORT SURVEY</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-8 max-w-2xl">
            Aplikasi resmi untuk mengumpulkan data akurat mengenai kejuaraan olahraga,
            peningkatan mutu pelatih &amp; wasit berlisensi, atlet berprestasi, serta evaluasi
            kebijakan keolahragaan daerah tingkat nasional maupun internasional.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/kuesioner">
              <Button
                variant="gold"
                size="lg"
                className="shadow-elevated hover:scale-[1.02] transition-transform"
              >
                <span>Mulai Isi Kuesioner</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Kuesioner Aktif Saat Ini */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text">
              Kuesioner Tersedia
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
              Pilih kuesioner aktif yang dapat Anda isi sesuai periode evaluasi tahun berjalan
            </p>
          </div>
          <Badge variant="success" className="px-3 py-1 text-xs">
            Periode Aktif 2024
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Kuesioner Utama Olahraga 2024 */}
          <div className="bg-white rounded-2xl border-2 border-brand-primary/20 hover:border-brand-primary shadow-card hover:shadow-elevated transition-all p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              RESMI
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                  Survey Keolahragaan Tahun 2024
                </h3>
                <p className="text-xs text-brand-text-secondary mt-1 line-clamp-2">
                  Kuesioner untuk mengetahui aktivitas, capaian prestasi nasional &amp; internasional,
                  serta fasilitas olahraga di wilayah Anda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-brand-text-secondary py-3 border-y border-gray-100 my-4">
              <div className="flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-brand-primary" />
                <span>8 Indikator (Kabupaten/Kota)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand-accent" />
                <span>Batas: 31 Desember 2024</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Format Bukti: PDF Resmi
              </span>
              <Link href="/kuesioner">
                <Button size="sm" variant="primary" className="gap-1.5">
                  <span>Isi Kuesioner</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Template Excell Kuisioner */}
      <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-card">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text tracking-tight">
            Template Excell Kuisioner
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
            Unduh template format spreadsheet Excel kuesioner keolahragaan resmi di bawah ini
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {SURVEY_TEMPLATES.map((item) => (
            <a
              key={item.id}
              href={`/templates/${encodeURIComponent(item.file)}`}
              download={item.file}
              className="flex items-center justify-between p-4 border border-gray-200/80 rounded-2xl hover:border-brand-primary/40 hover:bg-emerald-50/40 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md"
              title={item.name}
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <div className="p-3 bg-emerald-100/80 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-200/70 transition-colors">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span className="font-semibold text-brand-text text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
                  {item.name}
                </span>
              </div>

              <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-all duration-200">
                <Download className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 6 Langkah Alur Pengisian Kuesioner (Infografis Poster arindama.jpeg) */}
      <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-card">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text tracking-tight">
            Alur Pengisian Kuesioner (Untuk Responden)
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
            6 tahapan terarah untuk menyelesaikan pengisian kuesioner bidang keolahragaan
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            {
              step: 1,
              title: "1. Login",
              desc: "Masuk akun terverifikasi atau lanjutkan sebagai responden.",
            },
            {
              step: 2,
              title: "2. Beranda",
              desc: "Pilih instrumen survei keolahragaan tahun berjalan.",
            },
            {
              step: 3,
              title: "3. Identitas",
              desc: "Isi data diri, kecamatan, dan afiliasi cabor secara lengkap.",
            },
            {
              step: 4,
              title: "4. 8 Indikator",
              desc: "Jawab pertanyaan capaian nasional / internasional terstruktur.",
            },
            {
              step: 5,
              title: "5. Upload PDF",
              desc: "Lampirkan bukti sah (SK, sertifikat lisensi, piagam medali).",
            },
            {
              step: 6,
              title: "6. Selesai",
              desc: "Konfirmasi pengiriman dan dapatkan tanda bukti sah.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-brand-surface rounded-xl p-4 border border-gray-100 flex flex-col justify-between hover:border-brand-primary/30 transition-colors"
            >
              <div>
                <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center mb-2.5 shadow-subtle">
                  {item.step}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-brand-text mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ringkasan 8 Indikator Teknis Keolahragaan */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text">
              8 Indikator Arindama Keolahragaan
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
              8 Indikator Kabupaten/Kota
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SURVEY_INDICATORS.map((ind) => (
            <div
              key={ind.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-extrabold text-brand-primary bg-brand-primary-light px-2.5 py-0.5 rounded-full inline-block">
                    {ind.numberStr}
                  </span>
                  <Badge variant={ind.tingkatWilayah === "Provinsi" ? "info" : "neutral"} className="text-[10px] px-2 py-0">
                    {ind.tingkatWilayah}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-brand-text mb-1.5 leading-snug">
                  {ind.title}
                </h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  {ind.shortDesc}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-50 text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                  <span className="truncate">PDF sah</span>
                </div>
                <span className="text-[10px] font-bold text-brand-accent">Bobot {ind.bobotNilai}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LockSecurityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
