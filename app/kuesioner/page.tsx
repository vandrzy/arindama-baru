"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PdfDropzone } from "@/components/ui/pdf-dropzone";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import { SurveyAnswer, SurveySubmission } from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  FileCheck,
  ShieldAlert,
  User,
  Medal,
  Home,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function KuesionerPage() {
  const router = useRouter();
  const {
    draftIdentity,
    setDraftIdentity,
    draftAnswers,
    setDraftAnswers,
    addSubmission,
    clearDraft,
  } = useApp();

  // Step 0: Identitas Diri
  // Step 1 - 8: Indikator 1 sampai 8
  // Step 9: Tinjauan Akhir & Konfirmasi
  // Step 10: Halaman Sukses
  const [currentStep, setCurrentStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const totalSteps = 10; // 0 to 9

  // Helper current indicator (if step 1 to 8)
  const currentIndicator =
    currentStep >= 1 && currentStep <= 8 ? SURVEY_INDICATORS[currentStep - 1] : null;

  // Active answer object for current indicator
  const currentAnswer: SurveyAnswer = (currentIndicator && draftAnswers[currentIndicator.id]) || {
    indicatorId: currentIndicator?.id || 1,
    indicatorTitle: currentIndicator?.title || "",
    namaKegiatan: "",
    cabangOlahraga: "",
    tingkatPenyelenggaraan: "Nasional",
    sumberPendanaan: "APBD",
    capaianPrestasi: "",
    medaliEmas: 0,
    medaliPerak: 0,
    medaliPerunggu: 0,
    jumlahPeserta: 0,
    uraianKegiatan: "",
    fileBuktiName: "",
    fileBuktiSize: "",
    fileBuktiHash: "",
  };

  const handleUpdateAnswer = (field: keyof SurveyAnswer, value: unknown) => {
    if (!currentIndicator) return;
    setDraftAnswers((prev) => ({
      ...prev,
      [currentIndicator.id]: {
        ...currentAnswer,
        [field]: value,
      },
    }));
  };

  const validateStep = (): boolean => {
    setFormError(null);
    if (currentStep === 0) {
      const missing: Record<string, boolean> = {};
      if (!draftIdentity.namaLengkap.trim()) missing.namaLengkap = true;
      if (!draftIdentity.umur) missing.umur = true;
      if (!draftIdentity.jenisKelamin) missing.jenisKelamin = true;
      if (!draftIdentity.kecamatan.trim()) missing.kecamatan = true;
      if (!draftIdentity.pekerjaan.trim()) missing.pekerjaan = true;

      if (Object.keys(missing).length > 0) {
        setTouchedFields((prev) => ({ ...prev, ...missing }));
        setFormError("Mohon lengkapi seluruh kolom wajib identitas yang ditandai merah.");
        return false;
      }
      return true;
    }

    if (currentStep >= 1 && currentStep <= 8 && currentIndicator) {
      const ans = draftAnswers[currentIndicator.id];
      const missing: Record<string, boolean> = {};
      const prefix = `ind_${currentIndicator.id}_`;

      if (!ans || !ans.namaKegiatan?.trim()) missing[`${prefix}namaKegiatan`] = true;
      if (!ans || !ans.cabangOlahraga?.trim()) missing[`${prefix}cabangOlahraga`] = true;
      if (!ans || !ans.uraianKegiatan?.trim()) missing[`${prefix}uraianKegiatan`] = true;

      if (Object.keys(missing).length > 0) {
        setTouchedFields((prev) => ({ ...prev, ...missing }));
        setFormError("Mohon lengkapi kolom nama kegiatan, cabang olahraga, dan uraian capaian yang ditandai merah.");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 9));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setFormError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitSurvey = () => {
    setIsSubmitting(true);
    const newId = `SRV-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      const newSubmission: SurveySubmission = {
        id: newId,
        createdAt: new Date().toISOString(),
        tahunSurvei: 2024,
        responden: draftIdentity,
        answers: draftAnswers,
        status: "TERKIRIM",
        catatanVerifikator: "Menunggu verifikasi fisik berkas oleh Tim Dispora.",
        totalIndikatorTerisi: Object.keys(draftAnswers).length,
      };

      addSubmission(newSubmission);
      clearDraft();
      setIsSubmitting(false);
      setSubmittedId(newId);
      setCurrentStep(10); // Halaman Sukses
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  };

  // Step 10: Halaman Sukses (Sesuai Mockup Step 6 di Poster arindama.jpeg)
  if (currentStep === 10) {
    return (
      <div className="max-w-md mx-auto py-10 sm:py-16 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-elevated p-8 sm:p-10">
          {/* Ikon Lingkaran Centang Hijau Besar persis di Mockup Poster arindama.jpeg */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-subtle">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-text mb-2">
            Terima Kasih!
          </h2>
          <p className="text-sm text-brand-text-secondary leading-relaxed mb-6">
            Jawaban kuesioner dan dokumen bukti sah Anda telah{" "}
            <strong className="text-emerald-700">berhasil dikirim</strong> ke pangkalan data
            ARINDAMA SPORT SURVEY.
          </p>

          <div className="bg-brand-surface border border-gray-100 rounded-xl p-4 mb-8 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Nomor Registrasi:</span>
              <span className="font-bold text-brand-text tabular-nums">{submittedId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status Awal:</span>
              <span className="font-bold text-blue-700">TERKIRIM (Menunggu Verifikasi)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nama Pengisi:</span>
              <span className="font-semibold text-brand-text">{draftIdentity.namaLengkap}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="gold"
              size="lg"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
              className="w-full gap-2 font-bold shadow-subtle"
            >
              <span>🖨️ Cetak / Simpan Tanda Bukti Registrasi</span>
            </Button>

            <Link href="/" className="block w-full">
              <Button variant="primary" size="md" className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
            <Link href="/riwayat" className="block w-full">
              <Button variant="outline" size="md" className="w-full">
                Lihat Status di Riwayat Pengisian
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Header & Navigation Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-brand-text-secondary hover:text-brand-primary p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="Kembali"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-base sm:text-lg font-extrabold text-brand-text">
              {currentStep === 0
                ? "Identitas Responden"
                : currentStep === 9
                ? "Tinjauan & Konfirmasi Pengiriman"
                : `${currentIndicator?.numberStr}: ${currentIndicator?.title}`}
            </h1>
          </div>

          <span className="text-xs font-bold text-brand-primary bg-brand-primary-light px-3 py-1 rounded-full tabular-nums">
            {currentStep === 0
              ? "Tahap 1 dari 10"
              : currentStep === 9
              ? "Tahap Akhir"
              : `Indikator ${currentStep} dari 8`}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-brand-text-secondary">
          <span className="flex items-center gap-1">
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            Autosave aktif (Tersimpan otomatis)
          </span>
          <span>Progres: {Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* STEP 0: Formulir Identitas Responden (Sesuai Mockup Step 3 arindama.jpeg) */}
      {currentStep === 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-text">
                Data Diri &amp; Afiliasi Responden
              </h2>
              <p className="text-xs text-brand-text-secondary">
                Isi data diri Anda dengan lengkap dan benar sebelum mengisi pertanyaan kuesioner.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider">
                  Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                </label>
                {touchedFields.namaLengkap && !draftIdentity.namaLengkap.trim() && (
                  <span className="text-xs font-semibold text-red-600 animate-in fade-in">
                    Nama wajib diisi
                  </span>
                )}
              </div>
              <input
                type="text"
                value={draftIdentity.namaLengkap}
                onBlur={() => markTouched("namaLengkap")}
                onChange={(e) =>
                  setDraftIdentity((prev) => ({ ...prev, namaLengkap: e.target.value }))
                }
                placeholder="Contoh: Drs. Agus Prasetyo, M.Or."
                className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:ring-1 outline-none transition-all ${
                  touchedFields.namaLengkap && !draftIdentity.namaLengkap.trim()
                    ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand-primary focus:ring-brand-primary"
                }`}
              />
            </div>

            {/* Baris Umur & Jenis Kelamin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider">
                    Umur <span className="text-red-500">*</span>
                  </label>
                  {touchedFields.umur && !draftIdentity.umur && (
                    <span className="text-xs font-semibold text-red-600 animate-in fade-in">
                      Umur wajib diisi
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={draftIdentity.umur}
                    onBlur={() => markTouched("umur")}
                    onChange={(e) =>
                      setDraftIdentity((prev) => ({ ...prev, umur: e.target.value }))
                    }
                    placeholder="Contoh: 35"
                    className={`w-full h-11 px-3.5 pr-12 rounded-xl border text-sm focus:ring-1 outline-none transition-all tabular-nums ${
                      touchedFields.umur && !draftIdentity.umur
                        ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-200 focus:border-brand-primary focus:ring-brand-primary"
                    }`}
                  />
                  <span className="absolute right-3.5 text-xs text-gray-400">tahun</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </label>
                  {touchedFields.jenisKelamin && !draftIdentity.jenisKelamin && (
                    <span className="text-xs font-semibold text-red-600 animate-in fade-in">
                      Pilih jenis kelamin
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 h-11">
                  {["Laki-laki", "Perempuan"].map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => {
                        markTouched("jenisKelamin");
                        setDraftIdentity((prev) => ({
                          ...prev,
                          jenisKelamin: gender as "Laki-laki" | "Perempuan",
                        }));
                      }}
                      className={`rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                        draftIdentity.jenisKelamin === gender
                          ? "bg-brand-primary text-white border-brand-primary"
                          : touchedFields.jenisKelamin && !draftIdentity.jenisKelamin
                          ? "bg-white border-red-300 text-red-700 hover:bg-red-50/30"
                          : "bg-white border-gray-200 text-brand-text hover:bg-gray-50"
                      }`}
                    >
                      {draftIdentity.jenisKelamin === gender && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{gender}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Baris Kabupaten/Kota & Kecamatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Kabupaten / Kota Asal <span className="text-red-500">*</span>
                </label>
                <select
                  value={draftIdentity.kabupatenKota}
                  onChange={(e) =>
                    setDraftIdentity((prev) => ({ ...prev, kabupatenKota: e.target.value }))
                  }
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none bg-white transition-all"
                >
                  <option value="Kabupaten Sleman">Kabupaten Sleman</option>
                  <option value="Kabupaten Bantul">Kabupaten Bantul</option>
                  <option value="Kabupaten Gunungkidul">Kabupaten Gunungkidul</option>
                  <option value="Kabupaten Kulon Progo">Kabupaten Kulon Progo</option>
                  <option value="Kota Yogyakarta">Kota Yogyakarta</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-brand-text uppercase tracking-wider">
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  {touchedFields.kecamatan && !draftIdentity.kecamatan.trim() && (
                    <span className="text-xs font-semibold text-red-600 animate-in fade-in">
                      Kecamatan wajib diisi
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={draftIdentity.kecamatan}
                  onBlur={() => markTouched("kecamatan")}
                  onChange={(e) =>
                    setDraftIdentity((prev) => ({ ...prev, kecamatan: e.target.value }))
                  }
                  placeholder="Contoh: Depok / Mlati"
                  className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:ring-1 outline-none transition-all ${
                    touchedFields.kecamatan && !draftIdentity.kecamatan.trim()
                      ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-200 focus:border-brand-primary focus:ring-brand-primary"
                  }`}
                />
              </div>
            </div>

            {/* Pekerjaan / Instansi */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider">
                  Pekerjaan / Jabatan di Bidang Olahraga <span className="text-red-500">*</span>
                </label>
                {touchedFields.pekerjaan && !draftIdentity.pekerjaan.trim() && (
                  <span className="text-xs font-semibold text-red-600 animate-in fade-in">
                    Pekerjaan wajib diisi
                  </span>
                )}
              </div>
              <input
                type="text"
                value={draftIdentity.pekerjaan}
                onBlur={() => markTouched("pekerjaan")}
                onChange={(e) =>
                  setDraftIdentity((prev) => ({ ...prev, pekerjaan: e.target.value }))
                }
                placeholder="Contoh: Pelatih Cabor Renang / Pengurus KONI / Guru PJOK"
                className={`w-full h-11 px-3.5 rounded-xl border text-sm focus:ring-1 outline-none transition-all ${
                  touchedFields.pekerjaan && !draftIdentity.pekerjaan.trim()
                    ? "border-red-400 bg-red-50/20 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-200 focus:border-brand-primary focus:ring-brand-primary"
                }`}
              />
            </div>

            {/* Nomor Kontak WhatsApp / Telepon */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                Nomor Telepon / WhatsApp Aktif
              </label>
              <input
                type="tel"
                value={draftIdentity.nomorTelepon}
                onChange={(e) =>
                  setDraftIdentity((prev) => ({ ...prev, nomorTelepon: e.target.value }))
                }
                placeholder="Contoh: 0812-3456-7890"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all tabular-nums"
              />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 1 s/d 8: Pengisian 8 Indikator Keolahragaan Terstruktur */}
      {currentStep >= 1 && currentStep <= 8 && currentIndicator && (
        <Card className="space-y-6">
          {/* Card Info Indikator Sesuai Juknis kuesioner-hint.pdf */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Petunjuk Teknis Pengisian
                </h4>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  {currentIndicator.fullDesc}
                </p>
                <p className="text-xs font-semibold text-emerald-800 mt-2">
                  📌 {currentIndicator.focusHint}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Nama Kegiatan / Kejuaraan */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                Nama Kegiatan / Kejuaraan Olahraga <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentAnswer.namaKegiatan}
                onChange={(e) => handleUpdateAnswer("namaKegiatan", e.target.value)}
                placeholder="Contoh: Kejuaraan Nasional Pelajar 2024 / Pelatnas PB PRSI"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              />
            </div>

            {/* Cabang Olahraga */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                Cabang Olahraga <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={currentAnswer.cabangOlahraga}
                onChange={(e) => handleUpdateAnswer("cabangOlahraga", e.target.value)}
                placeholder="Contoh: Atletik / Renang / Bulu Tangkis / Taekwondo"
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
              />
            </div>

            {/* Tingkat Penyelenggaraan (Nasional / Internasional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Tingkat Penyelenggaraan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 h-11">
                  {["Nasional", "Internasional"].map((tingkat) => (
                    <button
                      key={tingkat}
                      type="button"
                      onClick={() => handleUpdateAnswer("tingkatPenyelenggaraan", tingkat)}
                      className={`rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                        currentAnswer.tingkatPenyelenggaraan === tingkat
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white border-gray-200 text-brand-text hover:bg-gray-50"
                      }`}
                    >
                      {currentAnswer.tingkatPenyelenggaraan === tingkat && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>{tingkat}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Sumber Pendanaan Kegiatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={currentAnswer.sumberPendanaan}
                  onChange={(e) => handleUpdateAnswer("sumberPendanaan", e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none bg-white transition-all"
                >
                  <option value="APBD">APBD (Daerah)</option>
                  <option value="APBN">APBN (Pusat / Kemenpora)</option>
                  <option value="Swasta/Sponsorship">Swasta / Sponsorship</option>
                  <option value="Kombinasi">Kombinasi (Pemerintah &amp; Swasta)</option>
                </select>
              </div>
            </div>

            {/* Perolehan Medali (Khusus Indikator 1 & 6) */}
            {(currentIndicator.id === 1 || currentIndicator.id === 6) && (
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-brand-accent" />
                  Perolehan Medali Prestasi
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="block text-xs text-amber-900 font-semibold mb-1">
                      🥇 Emas
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={currentAnswer.medaliEmas || 0}
                      onChange={(e) =>
                        handleUpdateAnswer("medaliEmas", parseInt(e.target.value) || 0)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-amber-200 text-sm bg-white tabular-nums"
                    />
                  </div>
                  <div>
                    <span className="block text-xs text-amber-900 font-semibold mb-1">
                      🥈 Perak
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={currentAnswer.medaliPerak || 0}
                      onChange={(e) =>
                        handleUpdateAnswer("medaliPerak", parseInt(e.target.value) || 0)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-amber-200 text-sm bg-white tabular-nums"
                    />
                  </div>
                  <div>
                    <span className="block text-xs text-amber-900 font-semibold mb-1">
                      🥉 Perunggu
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={currentAnswer.medaliPerunggu || 0}
                      onChange={(e) =>
                        handleUpdateAnswer("medaliPerunggu", parseInt(e.target.value) || 0)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-amber-200 text-sm bg-white tabular-nums"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Uraian Keterangan Capaian */}
            <div>
              <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                Uraian Capaian &amp; Keterangan Pendukung <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={currentAnswer.uraianKegiatan}
                onChange={(e) => handleUpdateAnswer("uraianKegiatan", e.target.value)}
                placeholder="Jelaskan secara ringkas hasil capaian, nomor pertandingan, nama atlet/pelatih/wasit yang terlibat..."
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all leading-relaxed"
              />
            </div>

            {/* Komponen Upload PDF Sah */}
            <div className="pt-2">
              <PdfDropzone
                label="Unggah Dokumen Bukti Sah (PDF)"
                hint={currentIndicator.requiredProof}
                value={
                  currentAnswer.fileBuktiName
                    ? {
                        name: currentAnswer.fileBuktiName,
                        size: currentAnswer.fileBuktiSize || "1.5 MB",
                        hash: currentAnswer.fileBuktiHash,
                      }
                    : undefined
                }
                onChange={(meta) => {
                  handleUpdateAnswer("fileBuktiName", meta?.name || "");
                  handleUpdateAnswer("fileBuktiSize", meta?.size || "");
                  handleUpdateAnswer("fileBuktiHash", meta?.hash || "");
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* STEP 9: Tinjauan & Konfirmasi Sebelum Kirim */}
      {currentStep === 9 && (
        <Card className="space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-text">
                Periksa Kembali Isian Anda
              </h2>
              <p className="text-xs text-brand-text-secondary">
                Pastikan data identitas dan jawaban 8 indikator telah sesuai dengan kondisi sebenarnya.
              </p>
            </div>
          </div>

          {/* Ringkasan Identitas */}
          <div className="bg-brand-surface rounded-xl p-4 border border-gray-100">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2">
              Identitas Responden:
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block">Nama:</span>
                <span className="font-semibold text-brand-text">{draftIdentity.namaLengkap}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Kecamatan/Daerah:</span>
                <span className="font-semibold text-brand-text">
                  {draftIdentity.kecamatan}, {draftIdentity.kabupatenKota}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Pekerjaan/Jabatan:</span>
                <span className="font-semibold text-brand-text">{draftIdentity.pekerjaan}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Kontak:</span>
                <span className="font-semibold text-brand-text tabular-nums">
                  {draftIdentity.nomorTelepon || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Ringkasan Isian 8 Indikator */}
          <div>
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-3">
              Ringkasan 8 Indikator Keolahragaan:
            </h3>
            <div className="space-y-2.5">
              {SURVEY_INDICATORS.map((ind) => {
                const ans = draftAnswers[ind.id];
                const isFilled = ans && ans.namaKegiatan;

                return (
                  <div
                    key={ind.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      isFilled
                        ? "bg-white border-emerald-200"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-primary">{ind.numberStr}:</span>
                        <span className="font-semibold text-brand-text">{ind.title}</span>
                      </div>
                      {isFilled && (
                        <p className="text-xs text-gray-500 mt-1">
                          Kegiatan: {ans.namaKegiatan} ({ans.cabangOlahraga} - {ans.tingkatPenyelenggaraan})
                          {ans.fileBuktiName && ` • 📄 ${ans.fileBuktiName}`}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                        isFilled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isFilled ? "Terisi" : "Dilewati"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pernyataan Kebenaran Data */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Saya menyatakan dengan sesungguhnya bahwa seluruh data dan dokumen yang saya
              unggah adalah sah dan benar untuk keperluan evaluasi pembangunan olahraga daerah.
            </p>
          </div>
        </Card>
      )}

      {/* Navigasi Bawah (Kembali / Selanjutnya / Kirim) */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 0 ? (
          <Button variant="outline" size="md" onClick={handleBack}>
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 9 ? (
          <Button variant="primary" size="md" onClick={handleNext}>
            <span>
              {currentStep === 0 ? "Mulai Jawab Pertanyaan" : "Indikator Selanjutnya"}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="gold"
            size="lg"
            onClick={handleSubmitSurvey}
            isLoading={isSubmitting}
            className="shadow-elevated font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Kirimkan Kuesioner Resmi</span>
          </Button>
        )}
      </div>
    </div>
  );
}
