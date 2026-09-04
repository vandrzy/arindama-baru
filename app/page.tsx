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
  History,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  LayoutDashboard,
  CheckCircle2,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";

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

            <Link href="/admin">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Portal Admin Olahraga</span>
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-emerald-200/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-accent" />
              <span>Standar 8 Indikator Resmi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Verifikasi Dokumen Bukti Sah (PDF)</span>
            </div>
            <div className="flex items-center gap-2">
              <LockSecurityIcon className="w-4 h-4 text-emerald-300" />
              <span>Kerahasiaan Terjamin (UU PDP No. 27/2022)</span>
            </div>
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
                <span>8 Indikator Terstruktur</span>
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

          {/* Card 2: Status Pengisian Responden */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-bold text-brand-text text-base">
                    Riwayat Pengisian Anda
                  </h3>
                </div>
                <Badge variant="neutral">
                  {submissions.length} Submisi Tercatat
                </Badge>
              </div>
              <p className="text-xs text-brand-text-secondary leading-relaxed mb-4">
                Lihat status peninjauan dan riwayat kuesioner yang telah Anda kirimkan ke tim verifikator dinas.
              </p>

              <div className="space-y-2">
                {submissions.slice(0, 2).map((sub) => (
                  <div
                    key={sub.id}
                    className="p-3 bg-brand-surface rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-brand-text block">
                        {sub.responden.namaLengkap}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {sub.responden.kabupatenKota} • {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <Badge
                      variant={
                        sub.status === "TERVERIFIKASI"
                          ? "success"
                          : sub.status === "TERKIRIM"
                          ? "info"
                          : "warning"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-2">
              <Link href="/riwayat">
                <Button variant="outline" size="sm" className="w-full">
                  Lihat Semua Riwayat Pengisian
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pemetaan 2 Jenis Pengguna Sesuai Panduan arindama.jpeg */}
      <section className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-card">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <Badge variant="gold" className="mb-2">
            PANDUAN PENGGUNA
          </Badge>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
            2 Jenis Pengguna dalam Sistem ARINDAMA
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1.5">
            Sistem dirancang dengan alur kerja khusus yang terisolasi sesuai kebutuhan masing-masing pengguna
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom 1: ADMIN */}
          <div className="rounded-2xl bg-amber-50/50 border border-amber-200/80 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-accent text-white flex items-center justify-center font-extrabold shadow-subtle">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-950">
                    ADMIN KEOLAHRAGAAN
                  </h3>
                  <span className="text-xs font-semibold text-amber-800">
                    Pengelola Survei &amp; Verifikator Dinas
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-amber-900 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <span>Membuat dan mengelola kuesioner keolahragaan daerah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <span>Mengatur 8 indikator teknis, pertanyaan terstruktur, dan bobot penilaian.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <span>Melihat data jawaban responden dan meninjau berkas bukti fisik PDF secara langsung.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  <span>Menghasilkan laporan resmi, rekapitulasi data, dan visualisasi grafik capaian olahraga.</span>
                </li>
              </ul>
            </div>

            <Link href="/admin">
              <Button variant="gold" size="md" className="w-full">
                <span>Akses Portal Admin Olahraga</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Kolom 2: USER / RESPONDEN */}
          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-200/80 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex items-center justify-center font-extrabold shadow-subtle">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">
                    USER / RESPONDEN
                  </h3>
                  <span className="text-xs font-semibold text-emerald-800">
                    Perwakilan Cabor, Atlet, Pelatih &amp; Pengurus
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-emerald-900 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>Melihat kuesioner keolahragaan yang sedang aktif dan terbuka.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>Mengisi data identitas diri dan instansi/kabupaten asal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>Menjawab pertanyaan kuesioner secara bertahap dan mengunggah dokumen PDF pendukung.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span>Melihat riwayat pengisian dan memantau status validasi dari verifikator.</span>
                </li>
              </ul>
            </div>

            <Link href="/kuesioner">
              <Button variant="primary" size="md" className="w-full">
                <span>Mulai Alur Responden</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
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
              Standar indikator prestasi nasional &amp; internasional sesuai petunjuk teknis kuesioner
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
                <span className="text-xs font-extrabold text-brand-primary bg-brand-primary-light px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {ind.numberStr}
                </span>
                <h4 className="text-sm font-bold text-brand-text mb-1.5 leading-snug">
                  {ind.title}
                </h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  {ind.shortDesc}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-gray-50 text-xs text-gray-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                <span className="truncate">Wajib lampiran PDF sah</span>
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
