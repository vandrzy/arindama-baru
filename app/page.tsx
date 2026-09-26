"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  UserCheck,
  ArrowRight,
  FileSpreadsheet,
  Download,
  Laptop,
  UploadCloud,
  ShieldCheck,
  BarChart3,
  FolderArchive,
} from "lucide-react";

const SURVEY_TEMPLATES = [
  {
    id: 1,
    title: "Identitas Responden",
    file: "IdentitasResponden_Fixed.xlsx",
    desc: "Form isian profil instansi, kontak penanggung jawab, dan data wilayah administratif.",
  },
  {
    id: 2,
    title: "Indikator 1: Kejuaraan Pelajar",
    file: "Indikator 1_Kejuaraan Pelajar Tingkat Nasional dan Internasional.xlsx",
    desc: "Data partisipasi dan perolehan medali pada kejuaraan pelajar tingkat nasional & internasional.",
  },
  {
    id: 3,
    title: "Indikator 2: Peningkatan Mutu SDM Olahraga",
    file: "Indikator 2_Peningkatan Mutu SDM Olahraga.xlsx",
    desc: "Sertifikasi, pelatihan, dan program peningkatan kapasitas SDM keolahragaan daerah.",
  },
  {
    id: 4,
    title: "Indikator 3: Pelatih Cabor Membawa Tim",
    file: "Indikator 3_Pelatih Cabor Membawa Tim Tingkat Nasional Internasional.xlsx",
    desc: "Rekam jejak pelatih cabang olahraga yang mendampingi tim nasional atau internasional.",
  },
  {
    id: 5,
    title: "Indikator 4: Wasit Cabor Lisensi Nasional/Int.",
    file: "Indikator 4_ Wasit Cabang Olahraga Masuk dalam Wasit Nasional Internasional.xlsx",
    desc: "Data lisensi resmi wasit cabang olahraga tingkat nasional maupun internasional.",
  },
  {
    id: 6,
    title: "Indikator 5: Wasit / Juri Bertugas di Event",
    file: "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional.xlsx",
    desc: "Penugasan aktif wasit dan juri daerah pada kegiatan olahraga resmi skala nasional/internasional.",
  },
  {
    id: 7,
    title: "Indikator 6: Atlet Membawa Nama Timnas",
    file: "Indikator 6_Atlet Cabang Olahraga Mewakili Tim Nasional Internasional.xlsx",
    desc: "Data atlet daerah yang terpilih memperkuat tim nasional pada ajang internasional.",
  },
  {
    id: 8,
    title: "Indikator 7: Penyelenggaraan Event Olahraga",
    file: "Indikator 7_Penyelenggaraan Event Olahraga Nasional Internasional.xlsx",
    desc: "Laporan pelaksanaan kejuaraan dan kegiatan keolahragaan yang diselenggarakan di daerah.",
  },
  {
    id: 9,
    title: "Indikator 8: Prestasi Olahraga Masyarakat",
    file: "Indikator 8_Prestasi Event Olahraga Masyarakat Tingkat Nasional.xlsx",
    desc: "Capaian prestasi pada festival dan kejuaraan olahraga masyarakat tingkat nasional.",
  },
];

const FLOW_STEPS = [
  {
    step: 1,
    title: "Daftar / Masuk (Login)",
    desc: "Buat akun untuk instansi Anda atau masuk menggunakan kredensial yang sudah ada.",
    icon: UserCheck,
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    step: 2,
    title: "Unduh Template Excel",
    desc: "Unduh template form Identitas dan ke-8 form Indikator (format .xlsx) yang tersedia di halaman beranda.",
    icon: FileSpreadsheet,
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    step: 3,
    title: "Isi Data Secara Offline",
    desc: "Lengkapi seluruh data capaian pada template Excel menggunakan aplikasi spreadsheet (Microsoft Excel / WPS) di komputer Anda secara offline.",
    icon: Laptop,
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    step: 4,
    title: "Unggah Kuesioner (Upload)",
    desc: "Masuk ke menu dasbor \"Isi Kuesioner\", lalu unggah ke-9 file Excel tersebut secara bersamaan.",
    icon: UploadCloud,
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    step: 5,
    title: "Unggah Bukti Validasi",
    desc: "Beralih ke menu \"Validasi\" di dasbor. Unggah berkas bukti pendukung berupa dokumen PDF (contoh: sertifikat, SK) untuk tiap-tiap capaian.",
    icon: ShieldCheck,
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
  {
    step: 6,
    title: "Selesai & Pantau Statistik",
    desc: "Lihat hasil akumulasi data olahraga Anda di menu \"Statistik\" secara real-time.",
    icon: BarChart3,
    badgeColor: "bg-emerald-100 text-emerald-800",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-primary via-[#0a482d] to-[#073622] text-white p-6 sm:p-10 lg:p-12 shadow-elevated border border-emerald-700/40">
        {/* Clean athletic stadium lines accent */}
        <div className="absolute top-0 right-0 w-80 h-full border-l border-emerald-700/20 pointer-events-none hidden md:block" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 px-3.5 py-1.5 rounded-full border border-emerald-700/50 text-xs font-semibold text-emerald-200 mb-4 sm:mb-6">
            <BrandLogo className="w-4 h-4" />
            <span>WEBSITE RESMI BIDANG KEOLAHRAGAAN DAERAH</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white mb-4">
            ARINDAMA <span className="text-brand-accent">SPORT SURVEY</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-8 max-w-2xl">
            Website resmi untuk mengumpulkan data akurat mengenai kejuaraan olahraga,
            peningkatan mutu pelatih &amp; wasit berlisensi, atlet berprestasi, serta evaluasi
            kebijakan keolahragaan daerah tingkat nasional maupun internasional.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/login">
              <Button
                variant="gold"
                size="lg"
                className="shadow-elevated hover:scale-[1.02] transition-transform gap-2 font-bold"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Section Alur Pengisian Kuesioner */}
      <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-card">
        <div className="mb-8">
          <Badge variant="neutral" className="mb-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-200">
            Panduan Responden
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text tracking-tight">
            Alur Pengisian Kuesioner
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
            6 tahapan mudah untuk menyelesaikan pengumpulan data keolahragaan daerah
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FLOW_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-brand-surface rounded-2xl p-5 border border-gray-100 hover:border-brand-primary/30 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-8 h-8 rounded-xl bg-brand-primary text-white text-xs font-extrabold flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform">
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
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Section Unduh Template Kuesioner Excel */}
      <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <Badge variant="neutral" className="mb-2 text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-200">
              Format Offline (.xlsx)
            </Badge>
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-text tracking-tight">
              Unduh Template Kuesioner Excel
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
              Unduh format spreadsheet Excel resmi untuk pengisian data kuesioner secara offline
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
              className="bg-white rounded-2xl border border-gray-200/90 p-5 hover:border-brand-primary/40 hover:bg-emerald-50/20 transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold tracking-wide uppercase bg-emerald-100/80 text-emerald-800 px-2.5 py-1 rounded-md">
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
                <span className="text-[11px] text-gray-400 font-medium truncate max-w-[170px]" title={item.file}>
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

