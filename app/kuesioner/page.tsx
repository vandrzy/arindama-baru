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
  UploadCloud,
  FileSpreadsheet,
  X,
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
  // Step 1 - 8: Indikator 1 sampai 8 (Kabupaten/Kota)
  // Step 9: Tinjauan Akhir & Konfirmasi
  // Step 10: Halaman Sukses
  const [currentStep, setCurrentStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [uploadedExcelFiles, setUploadedExcelFiles] = useState<Record<number, { name: string; size: string }>>({});

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

  const handleExcelFileSelected = (step: number, file: File | null) => {
    setFormError(null);
    if (!file) return;

    const fileName = file.name;
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isExcel) {
      setFormError("Gagal: Hanya file berekstensi .xlsx atau .xls yang diperbolehkan!");
      return;
    }

    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const fileData = { name: fileName, size: fileSize };

    setUploadedExcelFiles((prev) => ({
      ...prev,
      [step]: fileData,
    }));

    if (step === 0) {
      setDraftIdentity((prev) => ({
        ...prev,
        namaLengkap: prev.namaLengkap || "Responden (File Excel)",
        fileBuktiName: fileName,
      }));
    } else if (currentIndicator) {
      handleUpdateAnswer("fileBuktiName", fileName);
      handleUpdateAnswer("fileBuktiSize", fileSize);
      handleUpdateAnswer("namaKegiatan", `Upload Excel Indikator ${currentIndicator.id}`);
      handleUpdateAnswer("cabangOlahraga", "Sesuai Excel");
      handleUpdateAnswer("uraianKegiatan", `Dokumen Excel ${fileName} telah diunggah.`);
    }
  };

  const validateStep = (): boolean => {
    setFormError(null);
    if (currentStep === 0) {
      const hasFile = uploadedExcelFiles[0] || draftIdentity.fileBuktiName;
      if (!hasFile) {
        setFormError("Mohon unggah dokumen Excel Identitas Responden terlebih dahulu (.xlsx / .xls).");
        return false;
      }
      return true;
    }

    if (currentStep >= 1 && currentStep <= 8 && currentIndicator) {
      const ans = draftAnswers[currentIndicator.id];
      const hasFile = uploadedExcelFiles[currentStep] || ans?.fileBuktiName;

      if (!hasFile) {
        setFormError(`Mohon unggah dokumen Excel Indikator ${currentStep} (${currentIndicator.title}) terlebih dahulu (.xlsx / .xls).`);
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

  // Step 10: Halaman Sukses
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

      {/* STEP 0: Formulir Identitas Responden (Upload Form Excel) */}
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
                Unggah dokumen Excel identitas responden yang telah diisi sesuai template resmi.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">
              Unggah Dokumen Excell Identitas Responden <span className="text-red-500">*</span>
            </h3>

            <label className="relative flex flex-col items-center justify-center w-full p-8 sm:p-10 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:bg-emerald-50/20 hover:border-brand-primary cursor-pointer transition-all group">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleExcelFileSelected(0, file);
                }}
              />

              <div className="w-14 h-14 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-brand-primary" />
              </div>

              <p className="text-sm font-medium text-gray-700 text-center">
                <span className="text-brand-primary underline underline-offset-2 decoration-brand-primary/40 font-semibold">
                  Pilih dokumen Excell
                </span>{" "}
                atau seret ke area ini
              </p>

              <p className="text-xs text-gray-500 mt-2 text-center max-w-sm leading-relaxed">
                Dokumen Data Diri, Afiliasi, &amp; Kontak Responden (Format .xlsx / .xls)
              </p>
            </label>

            {(uploadedExcelFiles[0] || draftIdentity.fileBuktiName) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      {uploadedExcelFiles[0]?.name || draftIdentity.fileBuktiName}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {uploadedExcelFiles[0]?.size || "File Excel Siap Diunggah"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedExcelFiles((prev) => {
                      const copy = { ...prev };
                      delete copy[0];
                      return copy;
                    });
                    setDraftIdentity((prev) => ({ ...prev, fileBuktiName: "" }));
                  }}
                  className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 1 s/d 8: Form Upload Excel per Indikator */}
      {currentStep >= 1 && currentStep <= 8 && currentIndicator && (
        <Card className="space-y-6">
          {/* Card Info Indikator */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-3">
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

            {currentIndicator.keteranganInklusif && (
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-lg p-3 flex items-start gap-2.5">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Aspek Inklusivitas Penyandang Disabilitas
                </span>
                <p className="text-xs text-indigo-900 leading-relaxed">
                  {currentIndicator.keteranganInklusif}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Label Dinamis mengikuti Indikator */}
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">
              Unggah Dokumen Excell {currentIndicator.title} <span className="text-red-500">*</span>
            </h3>

            {/* Area Drag & Drop */}
            <label className="relative flex flex-col items-center justify-center w-full p-8 sm:p-10 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:bg-emerald-50/20 hover:border-brand-primary cursor-pointer transition-all group">
              <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleExcelFileSelected(currentStep, file);
                }}
              />

              <div className="w-14 h-14 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-brand-primary" />
              </div>

              <p className="text-sm font-medium text-gray-700 text-center">
                <span className="text-brand-primary underline underline-offset-2 decoration-brand-primary/40 font-semibold">
                  Pilih dokumen Excell
                </span>{" "}
                atau seret ke area ini
              </p>

              <p className="text-xs text-gray-500 mt-2 text-center max-w-sm leading-relaxed">
                Surat Penugasan Resmi, Hasil Pertandingan Resmi, Sertifikat, atau Piagam Medali (Format .xlsx / .xls)
              </p>
            </label>

            {/* File Terpilih Info */}
            {(uploadedExcelFiles[currentStep] || currentAnswer.fileBuktiName) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      {uploadedExcelFiles[currentStep]?.name || currentAnswer.fileBuktiName}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {uploadedExcelFiles[currentStep]?.size || currentAnswer.fileBuktiSize || "File Excel Siap Diunggah"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedExcelFiles((prev) => {
                      const copy = { ...prev };
                      delete copy[currentStep];
                      return copy;
                    });
                    handleUpdateAnswer("fileBuktiName", "");
                    handleUpdateAnswer("fileBuktiSize", "");
                  }}
                  className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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

          {/* Ringkasan Bobot & Auto-Scoring */}
          {(() => {
            let totalBobot = 0;
            let bobotMax = 0;
            SURVEY_INDICATORS.forEach((ind) => {
              const ans = draftAnswers[ind.id];
              const isFilled = ans && ans.namaKegiatan;
              if (ind.bobotNilai) {
                bobotMax += ind.bobotNilai;
                if (isFilled) totalBobot += ind.bobotNilai;
              }
            });
            const skor = bobotMax > 0 ? Math.round((totalBobot / bobotMax) * 100) : 0;
            return (
              <div className="bg-gradient-to-r from-brand-primary-light to-emerald-50 rounded-xl p-4 border border-brand-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
                      📊 Bobot Nilai Otomatis
                    </h3>
                    <p className="text-xs text-brand-text-secondary">
                      Indikator terisi: {totalBobot} dari {bobotMax} bobot maksimal
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-brand-primary tabular-nums">
                      {skor}
                    </div>
                    <div className="text-xs text-brand-text-secondary">Skor Akhir</div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-white/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${skor}%` }}
                  />
                </div>
              </div>
            );
          })()}

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
