"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import {
  CheckCircle2,
  User,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  FileSpreadsheet,
  X,
  Save,
} from "lucide-react";

export default function KuesionerPage() {
  const router = useRouter();
  const {
    currentUser,
    draftIdentity,
    setDraftIdentity,
    draftAnswers,
    setDraftAnswers,
    clearDraft,
  } = useApp();

  // Route protection: Must be logged in
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  const [rawFiles, setRawFiles] = useState<Record<number, File>>({});
  const [uploadedExcelFiles, setUploadedExcelFiles] = useState<
    Record<number, { name: string; size: string }>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const saveToGuestHistory = (submissionId: string) => {
    try {
      const existingIds = JSON.parse(
        localStorage.getItem("arindama_guest_submissions") || "[]"
      );
      if (!existingIds.includes(submissionId)) {
        existingIds.push(submissionId);
        localStorage.setItem(
          "arindama_guest_submissions",
          JSON.stringify(existingIds)
        );
      }
    } catch (e) {
      console.error("Gagal menyimpan ke localStorage", e);
    }
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

    setUploadedExcelFiles((prev) => ({
      ...prev,
      [step]: { name: fileName, size: fileSize },
    }));

    setRawFiles((prev) => ({
      ...prev,
      [step]: file,
    }));

    if (step === 0) {
      setDraftIdentity((prev) => ({
        ...prev,
        namaLengkap: prev.namaLengkap || currentUser?.nama || "Responden (File Excel)",
        fileBuktiName: fileName,
      }));
    } else {
      const indicator = SURVEY_INDICATORS[step - 1];
      if (indicator) {
        setDraftAnswers((prev) => ({
          ...prev,
          [indicator.id]: {
            indicatorId: indicator.id,
            indicatorTitle: indicator.title,
            namaKegiatan: `Upload Excel Indikator ${indicator.id}`,
            cabangOlahraga: "Sesuai Excel",
            tingkatPenyelenggaraan: "Nasional",
            sumberPendanaan: "APBD",
            capaianPrestasi: "",
            medaliEmas: 0,
            medaliPerak: 0,
            medaliPerunggu: 0,
            jumlahPeserta: 0,
            uraianKegiatan: `Dokumen Excel ${fileName} telah diunggah.`,
            fileBuktiName: fileName,
            fileBuktiSize: fileSize,
            fileBuktiHash: "",
          },
        }));
      }
    }
  };

  const handleRemoveFile = (step: number) => {
    setFormError(null);
    setUploadedExcelFiles((prev) => {
      const copy = { ...prev };
      delete copy[step];
      return copy;
    });

    setRawFiles((prev) => {
      const copy = { ...prev };
      delete copy[step];
      return copy;
    });

    if (step === 0) {
      setDraftIdentity((prev) => ({ ...prev, fileBuktiName: "" }));
    } else {
      const indicator = SURVEY_INDICATORS[step - 1];
      if (indicator) {
        setDraftAnswers((prev) => {
          const copy = { ...prev };
          delete copy[indicator.id];
          return copy;
        });
      }
    }
  };

  const handleSubmitSurvey = async () => {
    setFormError(null);

    // Check step 0 (Identitas)
    const hasIdentityFile = rawFiles[0] || uploadedExcelFiles[0] || draftIdentity.fileBuktiName;
    if (!hasIdentityFile) {
      setFormError("Mohon unggah dokumen Excel Identitas Responden terlebih dahulu (.xlsx / .xls).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Check step 1 to 8 (8 Indikator)
    for (let i = 1; i <= 8; i++) {
      const indicator = SURVEY_INDICATORS[i - 1];
      const hasIndFile = rawFiles[i] || uploadedExcelFiles[i] || draftAnswers[indicator.id]?.fileBuktiName;
      if (!hasIndFile) {
        setFormError(
          `Mohon unggah dokumen Excel Indikator ${i} (${indicator.title}) terlebih dahulu (.xlsx / .xls).`
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (currentUser?.id) {
        formData.append("userId", currentUser.id);
      }
      formData.append("tahunSurvei", "2024");

      // Append all raw files with key fileIndicator_{step}
      Object.entries(rawFiles).forEach(([stepStr, file]) => {
        formData.append(`fileIndicator_${stepStr}`, file);
      });

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim kuesioner.");
      }

      const newSubmissionId = result.submissionId || result.id;
      if (newSubmissionId) {
        saveToGuestHistory(newSubmissionId);
        setSubmittedId(newSubmissionId);
      }

      clearDraft();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setFormError(error.message || "Terjadi kesalahan saat mengirim kuesioner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not logged in, prevent rendering content while redirecting
  if (!currentUser) {
    return null;
  }

  // Halaman Sukses Pengiriman
  if (submittedId) {
    return (
      <div className="max-w-md mx-auto py-10 sm:py-16 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-elevated p-8 sm:p-10">
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
              <span className="font-semibold text-brand-text">{currentUser.nama || draftIdentity.namaLengkap}</span>
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
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-lg">
            📋
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-text">
              Formulir Kuesioner Indeks Pembangunan Olahraga
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-secondary">
              Lengkapi data identitas dan unggah berkas bukti fisik Excel untuk 8 indikator keolahragaan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 text-xs text-brand-text-secondary">
          <Save className="w-4 h-4 text-emerald-600" />
          <span>Autosave aktif • Harap unggah berkas Excel (.xlsx / .xls) untuk setiap indikator.</span>
        </div>
      </div>

      {/* Form Error Alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in shadow-subtle">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* Bagian 1: Identitas & Afiliasi Responden (Step 0) */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-brand-text">
              Data Diri &amp; Afiliasi Responden
            </h2>
            <p className="text-xs text-brand-text-secondary">
              Unggah dokumen Excel identitas responden yang telah diisi sesuai template resmi.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">
            Unggah Dokumen Excel Identitas Responden <span className="text-red-500">*</span>
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
                Pilih dokumen Excel
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
                onClick={() => handleRemoveFile(0)}
                className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Bagian 2: Daftar Form Indikator 1 s/d 8 */}
      <div className="space-y-6">
        {SURVEY_INDICATORS.map((indicator, index) => {
          const stepNum = index + 1;
          const uploadedFile = uploadedExcelFiles[stepNum];
          const draftAns = draftAnswers[indicator.id];
          const fileName = uploadedFile?.name || draftAns?.fileBuktiName;
          const fileSize = uploadedFile?.size || draftAns?.fileBuktiSize;

          return (
            <Card key={indicator.id} className="p-6 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-sm">
                  {indicator.id}
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-text">
                    {indicator.numberStr}: {indicator.title}
                  </h3>
                  <p className="text-xs text-brand-text-secondary">
                    Indikator Keolahragaan Ke-{indicator.id}
                  </p>
                </div>
              </div>

              {/* Box Petunjuk Teknis */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Petunjuk Teknis Pengisian
                    </h4>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      {indicator.fullDesc}
                    </p>
                    <p className="text-xs font-semibold text-emerald-800 mt-2">
                      📌 {indicator.focusHint}
                    </p>
                  </div>
                </div>

                {indicator.keteranganInklusif && (
                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-lg p-3 flex items-start gap-2.5">
                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Aspek Inklusivitas Penyandang Disabilitas
                    </span>
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      {indicator.keteranganInklusif}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  Unggah Dokumen Excel {indicator.title} <span className="text-red-500">*</span>
                </h4>

                <label className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:bg-emerald-50/20 hover:border-brand-primary cursor-pointer transition-all group">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleExcelFileSelected(stepNum, file);
                    }}
                  />

                  <div className="w-14 h-14 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6 text-brand-primary" />
                  </div>

                  <p className="text-sm font-medium text-gray-700 text-center">
                    <span className="text-brand-primary underline underline-offset-2 decoration-brand-primary/40 font-semibold">
                      Pilih dokumen Excel
                    </span>{" "}
                    atau seret ke area ini
                  </p>

                  <p className="text-xs text-gray-500 mt-2 text-center max-w-sm leading-relaxed">
                    Surat Penugasan Resmi, Hasil Pertandingan Resmi, Sertifikat, atau Piagam Medali (Format .xlsx / .xls)
                  </p>
                </label>

                {fileName && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">{fileName}</p>
                        <p className="text-[11px] text-emerald-700">
                          {fileSize || "File Excel Siap Diunggah"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(stepNum)}
                      className="p-1 rounded-lg hover:bg-emerald-200/50 text-emerald-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bagian 3: Pernyataan Kebenaran Data */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs sm:text-sm text-emerald-950 flex items-start gap-3 shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Saya menyatakan dengan sesungguhnya bahwa seluruh data dan dokumen Excel yang saya unggah
          adalah sah, valid, dan benar untuk keperluan evaluasi pembangunan olahraga daerah oleh Dinas Pemuda dan Olahraga.
        </p>
      </div>

      {/* Action Submit */}
      <div className="flex justify-end pt-2">
        <Button
          variant="gold"
          size="lg"
          onClick={handleSubmitSurvey}
          isLoading={isSubmitting}
          className="shadow-elevated font-bold gap-2 px-8 py-4 text-base"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Kirimkan Kuesioner Resmi</span>
        </Button>
      </div>
    </div>
  );
}
