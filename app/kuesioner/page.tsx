"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import {
  CheckCircle2,
  User,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  FileSpreadsheet,
  X,
  Hourglass,
  FolderDown,
  Download,
} from "lucide-react";

const FULL_TEMPLATE_NAMES: Record<number, string> = {
  0: "IdentitasResponden_Fixed.xlsx",
  1: "Indikator 1_Kejuaraan Pelajar Tingkat Nasional dan Internasional.xlsx",
  2: "Indikator 2_Peningkatan Mutu SDM Olahraga.xlsx",
  3: "Indikator 3_Pelatih Cabor Membawa Tim Tingkat Nasional Internasional.xlsx",
  4: "Indikator 4_ Wasit Cabang Olahraga Masuk dalam Wasit Nasional Internasional.xlsx",
  5: "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional.xlsx",
  6: "Indikator 6_Atlet Cabang Olahraga Mewakili Tim Nasional Internasional.xlsx",
  7: "Indikator 7_Penyelenggaraan Event Olahraga Nasional Internasional.xlsx",
  8: "Indikator 8_Prestasi Event Olahraga Masyarakat Tingkat Nasional.xlsx",
};

const EXPECTED_FILE_NAMES: Record<number, string[]> = {
  0: ["IdentitasResponden"],
  1: ["Indikator 1"],
  2: ["Indikator 2"],
  3: ["Indikator 3"],
  4: ["Indikator 4"],
  5: [
    "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional",
    "Indikator 5_WasitJuri yang Bertugas pada Kegiatan Nasional Internasional",
    "Indikator 5",
  ],
  6: ["Indikator 6"],
  7: ["Indikator 7"],
  8: ["Indikator 8"],
};

function isValidFileName(step: number, fileName: string): boolean {
  const keywords = EXPECTED_FILE_NAMES[step];
  if (!keywords) return true;
  return keywords.some((keyword) => fileName.includes(keyword));
}

interface UploadRowProps {
  step: number;
  title: string;
  templateName: string;
  rawFile?: File;
  uploadedFile?: { name: string; size: string };
  stepError?: string;
  onFileSelect: (step: number, file: File | null) => void;
  onRemoveFile: (step: number) => void;
}

function UploadRow({
  step,
  title,
  templateName,
  rawFile,
  uploadedFile,
  stepError,
  onFileSelect,
  onRemoveFile,
}: UploadRowProps) {
  const isError = Boolean(stepError);
  const isSuccess = Boolean(rawFile) && !isError;

  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] || null;
        if (file) onFileSelect(step, file);
      }}
      className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
        isError
          ? "bg-red-50/60 border-red-300 hover:border-red-400"
          : isSuccess
          ? "bg-white border-gray-200 shadow-sm hover:border-emerald-300"
          : "bg-white border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/20"
      }`}
    >
      <input
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onFileSelect(step, file);
          e.target.value = "";
        }}
      />

      {/* Left section: Icon + Info */}
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* State Icon */}
        <div className="shrink-0 mt-0.5">
          {isError ? (
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
          ) : isSuccess ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
              <Hourglass className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1 min-w-0 flex-1">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isError ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                {stepError}
              </span>
            ) : isSuccess ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                Sudah Diunggah &amp; Valid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                Belum Diunggah
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono bg-slate-100/80 text-slate-600 max-w-full break-all">
              <span className="text-slate-400 font-bold">#</span> Gunakan template resmi: {templateName}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight">
            {title}
          </h4>

          {/* Subtitle / Description / File Info */}
          {isError ? (
            <p className="text-xs sm:text-sm text-red-600/90 font-medium">
              Silakan periksa dan unggah kembali file Excel yang sesuai dengan format resmi.
            </p>
          ) : isSuccess ? (
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <span>
                File aktif: <strong className="text-slate-700 font-semibold">{uploadedFile?.name || rawFile?.name}</strong>
              </span>
              <span>•</span>
              <span className="text-slate-500">{uploadedFile?.size || "Berkas Siap"}</span>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500">
              Tarik file Excel ke baris ini atau klik tombol pilih file di kanan
            </p>
          )}
        </div>
      </div>

      {/* Right Action Button */}
      <div className="shrink-0 self-end sm:self-center flex items-center gap-2">
        {isError ? (
          <span className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors">
            <UploadCloud className="w-4 h-4" />
            Pilih File
          </span>
        ) : isSuccess ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors">
              <UploadCloud className="w-4 h-4 text-gray-500" />
              Ganti File
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRemoveFile(step);
              }}
              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
              title="Hapus File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-colors">
            <UploadCloud className="w-4 h-4" />
            Pilih File
          </span>
        )}
      </div>
    </label>
  );
}

export default function KuesionerPage() {
  const router = useRouter();
  const {
    currentUser,
    isLoading,
    draftIdentity,
    setDraftIdentity,
    draftAnswers,
    setDraftAnswers,
    clearDraft,
  } = useApp();

  // Route protection: Tunggu proses rehidrasi sesi (isLoading === false) sebelum redirect ke login
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login");
    }
  }, [isLoading, currentUser, router]);

  const [rawFiles, setRawFiles] = useState<Record<number, File>>({});
  const [uploadedExcelFiles, setUploadedExcelFiles] = useState<
    Record<number, { name: string; size: string }>
  >({});
  const [previewData, setPreviewData] = useState<Record<number, any[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submittedNoReg, setSubmittedNoReg] = useState<string | null>(null);

  const setStepError = (step: number, msg: string | null) => {
    setStepErrors((prev) => {
      const copy = { ...prev };
      if (!msg) {
        delete copy[step];
      } else {
        copy[step] = msg;
      }
      return copy;
    });
  };

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

  const handleExcelFileSelected = async (step: number, file: File | null) => {
    setFormError(null);
    setStepError(step, null);

    if (!file) {
      setPreviewData((prev) => {
        const copy = { ...prev };
        delete copy[step];
        return copy;
      });
      return;
    }

    const fileName = file.name;
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isExcel) {
      setStepError(step, "Gagal: Hanya file berekstensi .xlsx atau .xls yang diperbolehkan!");
      return;
    }

    if (!isValidFileName(step, fileName)) {
      setStepError(step, "Gagal: Nama file tidak sesuai untuk form ini.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setStepError(step, "Gagal: File Excel tidak memiliki sheet yang valid.");
        return;
      }
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      const nonEmptyRows = rawRows.filter(
        (row) => row && row.length > 0 && row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "")
      );

      const HEADER_ROW_COUNT = 1;
      if (nonEmptyRows.length <= HEADER_ROW_COUNT) {
        setStepError(step, "Gagal: File Excel yang diunggah kosong atau hanya berisi template/header! Pastikan data telah diisi.");
        return;
      }

      // Validasi ketat kelengkapan kolom wajib per baris
      const headerRow = rawRows[0].map((h: any) => String(h || "").trim());
      const dataRows = rawRows.slice(1);

      for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
        const row = dataRows[rIdx];
        const isRowEmpty = !row || !row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "");
        if (isRowEmpty) continue;

        const displayRow = rIdx + 2;

        for (let cIdx = 0; cIdx < headerRow.length; cIdx++) {
          const colName = headerRow[cIdx];
          if (!colName) continue;

          const colLower = colName.toLowerCase();
          // Atribut medali bersifat opsional
          if (colLower.includes("medali")) continue;

          const val = row[cIdx];
          if (val === null || val === undefined || String(val).trim() === "") {
            setStepError(
              step,
              `Gagal: Data pada baris ke-${displayRow} kolom '${colName}' masih kosong. Harap lengkapi file Excel Anda.`
            );
            return;
          }
        }
      }

      const previewJsonData = XLSX.utils.sheet_to_json(worksheet);
      setPreviewData((prev) => ({
        ...prev,
        [step]: previewJsonData.slice(0, 5),
      }));

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
    } catch (err) {
      console.error("Gagal membaca file Excel:", err);
      setStepError(step, "Gagal membaca file Excel. Pastikan format file tidak rusak.");
    }
  };

  const handleRemoveFile = (step: number) => {
    setFormError(null);
    setStepError(step, null);
    setPreviewData((prev) => {
      const copy = { ...prev };
      delete copy[step];
      return copy;
    });
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
    if (!rawFiles[0]) {
      setFormError("Mohon unggah dokumen Excel Identitas Responden terlebih dahulu (.xlsx / .xls).");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Check step 1 to 8 (8 Indikator)
    for (let i = 1; i <= 8; i++) {
      const indicator = SURVEY_INDICATORS[i - 1];
      if (!rawFiles[i]) {
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
        if (response.status === 401) {
          router.push("/login");
        }
        throw new Error(result.error || "Gagal mengirim kuesioner.");
      }

      const newSubmissionId = result.submissionId || result.id;
      const noRegistrasi = result.submission?.noRegistrasi;
      if (newSubmissionId) {
        saveToGuestHistory(newSubmissionId);
        setSubmittedId(newSubmissionId);
        if (noRegistrasi) {
          setSubmittedNoReg(noRegistrasi);
        }
      }

      clearDraft();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setFormError(error.message || "Terjadi kesalahan saat mengirim kuesioner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Jika sedang memuat sesi atau tidak logged in, tahan render sementara redirect berjalan
  if (isLoading || !currentUser) {
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
            Data anda telah berhasil disimpan, mohon simpan nomor registrasi untuk melakukan validasi data
          </p>

          <div className="bg-brand-surface border border-gray-100 rounded-xl p-4 mb-8 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Nomor Registrasi:</span>
              <span className="font-bold text-brand-text tabular-nums">{submittedNoReg || submittedId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nama Pengisi:</span>
              <span className="font-semibold text-brand-text">{currentUser.nama || draftIdentity.namaLengkap}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              size="md" 
              className="w-full"
              onClick={() => {
                const doc = new jsPDF();
                
                doc.setFontSize(14);
                doc.text("BUKTI KIRIM KUESIONER ARINDAMA SPORT SURVEY", 105, 20, { align: "center" });
                
                doc.setFontSize(12);
                doc.text("Data anda telah berhasil disimpan, mohon simpan nomor registrasi untuk", 20, 40);
                doc.text("melakukan validasi data.", 20, 47);
                
                doc.text(`Nomor Registrasi : ${submittedNoReg || submittedId}`, 20, 65);
                doc.text(`Nama Pengisi     : ${currentUser.nama || draftIdentity.namaLengkap}`, 20, 75);
                doc.text(`Tanggal          : ${new Date().toLocaleString('id-ID')}`, 20, 85);
                
                doc.save(`Bukti_Kirim_${submittedNoReg || submittedId}.pdf`);
              }}
            >
              Download Bukti Kirim
            </Button>
            <Link href="/validasi" className="block w-full">
              <Button variant="primary" size="md" className="w-full">
                Lakukan Validasi Data
              </Button>
            </Link>
            <Link href="/" className="block w-full">
              <Button variant="outline" size="md" className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6 animate-in fade-in duration-300">
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
      </div>

      {/* Form Error Alert */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in shadow-subtle">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* Banner Unduh Template Kuesioner Resmi */}
      <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 md:mt-0">
            <FolderDown className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              Unduh Terlebih Dahulu Template Kuesioner Resmi
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              Pastikan Anda telah mengunduh paket template kuesioner resmi (.xlsx) sebelum melakukan pengisian data. Gunakan format tabel baku tanpa mengubah struktur kolom agar proses validasi sistem berjalan lancar.
            </p>
          </div>
        </div>
        <a
          href="/templates/Semua_Template_Kuesioner.zip"
          download
          className="inline-flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-colors shadow-sm self-stretch sm:self-auto justify-center"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Semua Template (.ZIP)</span>
        </a>
      </div>

      {/* Daftar Card Form Upload Excel */}
      <div className="space-y-4">
        {/* Step 0: Identitas Responden */}
        <UploadRow
          step={0}
          title="Identitas & Afiliasi Responden"
          templateName={FULL_TEMPLATE_NAMES[0]}
          rawFile={rawFiles[0]}
          uploadedFile={uploadedExcelFiles[0]}
          stepError={stepErrors[0]}
          onFileSelect={handleExcelFileSelected}
          onRemoveFile={handleRemoveFile}
        />

        {/* Step 1 s/d 8: Indikator Keolahragaan */}
        {SURVEY_INDICATORS.map((indicator, index) => {
          const stepNum = index + 1;
          return (
            <UploadRow
              key={indicator.id}
              step={stepNum}
              title={`${indicator.numberStr}: ${indicator.title}`}
              templateName={FULL_TEMPLATE_NAMES[indicator.id]}
              rawFile={rawFiles[stepNum]}
              uploadedFile={uploadedExcelFiles[stepNum]}
              stepError={stepErrors[stepNum]}
              onFileSelect={handleExcelFileSelected}
              onRemoveFile={handleRemoveFile}
            />
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

