"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import { FULL_TEMPLATE_NAMES, isValidFileName } from "@/lib/constants/ui-data";
import * as XLSX from "xlsx";
import { fixWorksheetRange } from "@/lib/services/excelService";
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
  Eye,
  EyeOff,
  ChevronUp,
} from "lucide-react";

interface UploadRowProps {
  step: number;
  title: string;
  templateName: string;
  rawFile?: File;
  uploadedFile?: { name: string; size: string };
  previewRows?: any[];
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
  previewRows,
  stepError,
  onFileSelect,
  onRemoveFile,
}: UploadRowProps) {
  const isError = Boolean(stepError);
  const isSuccess = Boolean(rawFile) && !isError;
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSuccess || !previewRows || previewRows.length === 0) {
      setShowPreview(false);
    }
  }, [isSuccess, previewRows]);

  const headers = previewRows && previewRows.length > 0 ? Object.keys(previewRows[0]) : [];
  const badgeText = step === 0 ? "Identitas" : `Indikator ${step}`;
  const cleanTitle = title.replace(/^(Indikator \d+:\s*|Identitas\s*&\s*)/i, "");

  const handleZoneClick = () => {
    if (!isSuccess && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
      {/* 1. Header Bagian Atas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Gunakan template excel <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold text-xs">{templateName}</code> untuk mengisi form ini.
          </p>
        </div>

        {/* State badge info jika ada error atau success */}
        {isError && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 shrink-0 self-start sm:self-center">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            File Tidak Valid
          </span>
        )}
        {isSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shrink-0 self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Sudah Diunggah &amp; Valid
          </span>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* 2. Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0] || null;
          if (file) onFileSelect(step, file);
        }}
        onClick={handleZoneClick}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-colors ${
          isError
            ? "border-red-300 bg-red-50/50 cursor-pointer hover:bg-red-50/80"
            : isSuccess
            ? "border-emerald-300 bg-emerald-50/30"
            : "border-emerald-300 bg-white hover:bg-emerald-50/40 cursor-pointer"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".xlsx, .xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onFileSelect(step, file);
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center mb-3">
            {isError ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <UploadCloud className="w-6 h-6 text-emerald-600" />
            )}
          </div>

          {isSuccess ? (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                File aktif: <strong className="text-gray-900 font-bold">{uploadedFile?.name || rawFile?.name}</strong>{" "}
                <span className="text-gray-400">({uploadedFile?.size || "Berkas Siap"})</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {previewRows && previewRows.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(!showPreview);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs"
                  >
                    {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPreview ? "Sembunyikan Preview" : "Preview Data"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-gray-500" />
                  <span>Ganti File</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(step);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ) : isError ? (
            <div className="space-y-1.5 max-w-lg">
              <p className="text-xs sm:text-sm font-bold text-red-700 leading-snug">
                {stepError}
              </p>
              <p className="text-xs text-red-600/80 font-medium">
                Klik di sini atau tarik file Excel baru yang sesuai dengan template resmi untuk mengunggah ulang.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm text-gray-700 mb-1">
                Tarik file Excel ke sini, atau{" "}
                <span className="text-emerald-700 font-bold hover:underline cursor-pointer inline-block">
                  Pilih Berkas
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Format yang didukung: .xlsx, .xls
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Expandable Preview Section */}
      {isSuccess && showPreview && previewRows && previewRows.length > 0 && (
        <div className="border border-emerald-100 bg-slate-50/70 p-4 sm:p-5 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-700" />
              <h5 className="text-xs sm:text-sm font-bold text-gray-900">
                Pratinjau Isi File Excel ({uploadedFile?.name || rawFile?.name})
              </h5>
              <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                {previewRows.length} Record
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-xs"
            >
              <span>Sembunyikan</span>
              <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          <div className="overflow-x-auto max-h-80 border border-gray-200 rounded-xl bg-white shadow-subtle custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-emerald-900 text-white uppercase tracking-wider text-[11px] font-bold z-10">
                <tr>
                  <th className="p-3 w-10 text-center border-r border-emerald-800">No</th>
                  {headers.map((h, i) => (
                    <th key={i} className="p-3 border-r border-emerald-800 whitespace-nowrap min-w-[130px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                {previewRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-emerald-50/50 transition-colors odd:bg-white even:bg-gray-50/40">
                    <td className="p-2.5 text-center font-bold text-gray-400 border-r border-gray-100 bg-gray-50/70">
                      {rIdx + 1}
                    </td>
                    {headers.map((h, cIdx) => (
                      <td key={cIdx} className="p-2.5 border-r border-gray-100 max-w-xs truncate" title={String(row[h] ?? "")}>
                        {row[h] !== undefined && row[h] !== null && String(row[h]).trim() !== "" ? String(row[h]) : "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
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
      fixWorksheetRange(worksheet);

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
        [step]: previewJsonData,
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#04331d] via-[#07482b] to-[#042917] text-white p-6 sm:p-10 shadow-elevated border border-emerald-800/40">
        {/* Decorative Clipboard & Survey Icon Graphic on Right Side */}
        <div className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-10 pointer-events-none hidden md:block opacity-20">
          <svg
            className="w-44 h-52 text-emerald-200"
            viewBox="0 0 160 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Clipboard Base Frame */}
            <rect
              x="15"
              y="25"
              width="130"
              height="155"
              rx="16"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            {/* Top Clip Header */}
            <path
              d="M50 25V18C50 13.5817 53.5817 10 58 10H102C106.418 10 110 13.5817 110 18V25"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="62"
              y="18"
              width="36"
              height="12"
              rx="4"
              stroke="currentColor"
              strokeWidth="5"
            />
            {/* Checkbox 1 + Line */}
            <rect x="35" y="60" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="6" />
            <path d="M39 69L43 73L51 63" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M65 69H125" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />

            {/* Checkbox 2 + Line */}
            <rect x="35" y="100" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="6" />
            <path d="M39 109L43 113L51 103" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M65 109H125" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />

            {/* Checkbox 3 + Line */}
            <rect x="35" y="140" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="6" />
            <path d="M39 149L43 153L51 143" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M65 149H110" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Formulir Kuesioner Indeks Pembangunan Olahraga
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Lengkapi data identitas dan unggah berkas bukti fisik Excel untuk 8 indikator keolahragaan daerah secara bertahap.
          </p>
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
          previewRows={previewData[0]}
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
              previewRows={previewData[stepNum]}
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
          <span>Kirimkan Data</span>
        </Button>
      </div>
    </div>
  );
}

