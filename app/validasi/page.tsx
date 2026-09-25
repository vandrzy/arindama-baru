"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import * as XLSX from "xlsx";
import {
  FileCheck,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Upload,
  User,
  Info,
  Check,
  Loader2,
  Database,
  Eye,
  FileUp,
} from "lucide-react";

interface FormOption {
  id: string;
  label: string;
  filename: string;
}

const FORM_OPTIONS: FormOption[] = [
  { id: "0", label: "Form Identitas Responden", filename: "IdentitasResponden_Fixed.xlsx" },
  { id: "1", label: "Indikator 1: Kejuaraan Pelajar Tingkat Nasional dan Internasional", filename: "Indikator 1_Kejuaraan Pelajar Tingkat Nasional dan Internasional.xlsx" },
  { id: "2", label: "Indikator 2: Peningkatan Mutu SDM Olahraga", filename: "Indikator 2_Peningkatan Mutu SDM Olahraga.xlsx" },
  { id: "3", label: "Indikator 3: Pelatih Cabor Membawa Tim Tingkat Nasional/Internasional", filename: "Indikator 3_Pelatih Cabor Membawa Tim Tingkat Nasional Internasional.xlsx" },
  { id: "4", label: "Indikator 4: Wasit Cabang Olahraga Masuk Wasit Nasional/Internasional", filename: "Indikator 4_ Wasit Cabang Olahraga Masuk dalam Wasit Nasional Internasional.xlsx" },
  { id: "5", label: "Indikator 5: Wasit/Juri Bertugas Kegiatan Nasional/Internasional", filename: "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional.xlsx" },
  { id: "6", label: "Indikator 6: Atlet Cabang Olahraga Mewakili Tim Nasional/Internasional", filename: "Indikator 6_Atlet Cabang Olahraga Mewakili Tim Nasional Internasional.xlsx" },
  { id: "7", label: "Indikator 7: Penyelenggaraan Event Olahraga Nasional/Internasional", filename: "Indikator 7_Penyelenggaraan Event Olahraga Nasional Internasional.xlsx" },
  { id: "8", label: "Indikator 8: Prestasi Event Olahraga Masyarakat Tingkat Nasional", filename: "Indikator 8_Prestasi Event Olahraga Masyarakat Tingkat Nasional.xlsx" },
];

export default function ValidasiPage() {
  const router = useRouter();
  const { currentUser, isLoading: isSessionLoading } = useApp();

  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [isFetchingSubmissions, setIsFetchingSubmissions] = useState(true);

  // Dropdown States
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
  const [selectedFormId, setSelectedFormId] = useState<string>("");

  // Excel & Table Data States
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isLoadingExcel, setIsLoadingExcel] = useState<boolean>(false);
  const [isFromDatabase, setIsFromDatabase] = useState<boolean>(false);

  // Validation Evidences database state: recordId ("row_0", "row_1") -> evidence item
  const [rowValidationFiles, setRowValidationFiles] = useState<
    Record<string, { id?: string; fileName: string; fileUrl: string; fileSize?: string; updatedAt?: string }>
  >({});
  const [uploadingRows, setUploadingRows] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<string | null>(null);

  // Protected route & fetch submissions list
  useEffect(() => {
    if (isSessionLoading) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function loadSubmissions() {
      try {
        const res = await fetch("/api/submissions");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.submissions)) {
            setSubmissionsList(data.submissions);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil daftar kuesioner:", err);
      } finally {
        setIsFetchingSubmissions(false);
      }
    }

    loadSubmissions();
  }, [isSessionLoading, currentUser, router]);

  // Fetch uploaded evidences from DB when submission & form are selected
  const fetchEvidences = async (subId: string, formId: string) => {
    try {
      const res = await fetch(
        `/api/validasi/evidences?submissionId=${encodeURIComponent(subId)}&formType=${encodeURIComponent(formId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.evidences)) {
          const map: Record<string, any> = {};
          data.evidences.forEach((ev: any) => {
            map[ev.recordId] = ev;
          });
          setRowValidationFiles(map);
        }
      }
    } catch (err) {
      console.error("Gagal memuat bukti validasi dari database:", err);
    }
  };

  // Otomatis muat data record dari database saat Dropdown Kuesioner & Form dipilih
  useEffect(() => {
    setTableData([]);
    setTableHeaders([]);
    setActiveFileName(null);
    setParseError(null);
    setRowValidationFiles({});
    setIsFromDatabase(false);

    if (!selectedSubmissionId || !selectedFormId) return;

    // Fetch existing validation evidences for this submission & form
    fetchEvidences(selectedSubmissionId, selectedFormId);

    setIsLoadingExcel(true);
    fetch(
      `/api/records?submissionId=${encodeURIComponent(selectedSubmissionId)}&formType=${encodeURIComponent(selectedFormId)}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Gagal mengunduh data dari database`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.records) && data.records.length > 0) {
          const headers = Object.keys(data.records[0]);
          setTableHeaders(headers);
          setTableData(data.records);
          setActiveFileName(`Database Record (${selectedFormId})`);
          setIsFromDatabase(true);
        } else {
          setParseError(
            `Belum ada data record yang tersimpan di database untuk ${selectedForm?.label || "form ini"}.`
          );
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data dari database:", err);
        setParseError(`Tidak dapat memuat data dari database. ${err.message || ""}.`);
      })
      .finally(() => {
        setIsLoadingExcel(false);
      });
  }, [selectedSubmissionId, selectedFormId]);

  // Handler saat user mengunggah file Excel manual di halaman validasi jika file belum ada di DB
  const handleExcelUpload = async (file: File) => {
    setParseError(null);
    setActiveFileName(file.name);
    setIsFromDatabase(false);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        setParseError("File Excel tidak memiliki sheet yang valid.");
        setTableData([]);
        setTableHeaders([]);
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

      if (!jsonData || jsonData.length === 0) {
        setParseError("File Excel yang dipilih kosong atau tidak memiliki record data.");
        setTableData([]);
        setTableHeaders([]);
        return;
      }

      // Ambil headers dari row pertama
      const headers = Object.keys(jsonData[0]);
      setTableHeaders(headers);
      setTableData(jsonData);
    } catch (err) {
      console.error("Error parsing Excel:", err);
      setParseError("Gagal membaca berkas Excel. Pastikan format file .xlsx / .xls valid.");
      setTableData([]);
      setTableHeaders([]);
    }
  };

  // Handler upload berkas bukti per-row ke Vercel Blob & DB
  const handleRowFileUpload = async (rowIndex: number, file: File | null) => {
    if (!file || !selectedSubmissionId || !selectedFormId) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB Limit

    const fileNameLower = file.name.toLowerCase();
    if (!fileNameLower.endsWith(".pdf") && file.type !== "application/pdf") {
      alert("Hanya berkas berekstensi .pdf yang diperbolehkan untuk bukti validasi.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`Ukuran file '${file.name}' (${fileSizeMB} MB) melebihi batas maksimum 2 MB.`);
      return;
    }

    const recordId = `row_${rowIndex}`;
    setUploadingRows((prev) => ({ ...prev, [recordId]: true }));

    try {
      const selectedFormObj = FORM_OPTIONS.find((f) => f.id === selectedFormId);
      const namaFormLabel = selectedFormObj?.label || `Indikator-${selectedFormId}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("submissionId", selectedSubmissionId);
      formData.append("formType", selectedFormId);
      formData.append("recordId", recordId);
      formData.append("namaForm", namaFormLabel);

      const res = await fetch("/api/validasi/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah berkas validasi.");
      }

      // Update state local
      setRowValidationFiles((prev) => ({
        ...prev,
        [recordId]: data.evidence,
      }));

      setNotification(`Berhasil mengunggah PDF '${file.name}' untuk record Baris #${rowIndex + 1}`);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (err: any) {
      console.error("Gagal mengunggah berkas validasi:", err);
      alert(`Gagal unggah: ${err.message || "Terjadi kesalahan"}`);
    } finally {
      setUploadingRows((prev) => ({ ...prev, [recordId]: false }));
    }
  };

  // Handler untuk membuka/melihat file PDF via download proxy
  const handleViewPdf = (fileUrl: string) => {
    const proxyUrl = `/api/files/download?url=${encodeURIComponent(fileUrl)}`;
    window.open(proxyUrl, "_blank");
  };

  if (isSessionLoading || !currentUser) {
    return null;
  }

  const selectedSubmission = submissionsList.find((s) => s.id === selectedSubmissionId);
  const selectedForm = FORM_OPTIONS.find((f) => f.id === selectedFormId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-elevated flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Halaman (Card Header) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold text-lg shrink-0">
            <FileCheck className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-text">
              Validasi Kelengkapan Data
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-secondary mt-0.5">
              Verifikasi dan unggah berkas bukti pendukung per baris record data kuesioner (format .pdf)
            </p>
          </div>
        </div>
      </div>

      {/* Card Header Utama & Dropdowns */}
      <Card className="p-6 bg-white border border-gray-100 shadow-card rounded-3xl space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-brand-primary flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-brand-accent" />
            <span>Upload kelengkapan berkas untuk validasi data</span>
          </h2>
          <p className="text-xs text-brand-text-secondary mt-1">
            Pilih kuesioner dan form excel yang hendak divalidasi di bawah ini untuk menampilkan data dari database.
          </p>
        </div>

        {/* 2 Dropdown Pemilihan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dropdown 1: Kuesioner / Submisi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-primary" />
              <span>1. Pilih Kuesioner (Submisi Responden)</span>
            </label>
            <select
              value={selectedSubmissionId}
              onChange={(e) => setSelectedSubmissionId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-brand-text focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
            >
              <option value="">-- Pilih Kuesioner Submisi --</option>
              {submissionsList.map((sub) => {
                const respondentName = sub.user?.nama || "Responden";
                const dateStr = new Date(sub.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <option key={sub.id} value={sub.id}>
                    No. Reg: {sub.noRegistrasi || sub.id} | {respondentName} ({dateStr})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Dropdown 2: Form Excel yang divalidasi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-text flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-brand-accent" />
              <span>2. Pilih Form Excel divalidasi</span>
            </label>
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white text-brand-text focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-colors"
              disabled={!selectedSubmissionId}
            >
              <option value="">-- Pilih Form Excel --</option>
              {FORM_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Summary Info */}
        {selectedSubmission && selectedForm && (
          <div className="bg-brand-primary-light/40 border border-brand-primary/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-brand-primary block text-xs">
                Kuesioner Terpilih:
              </span>
              <p className="text-brand-text font-medium">
                <strong className="font-mono">{selectedSubmission.noRegistrasi || selectedSubmission.id}</strong> -{" "}
                {selectedSubmission.user?.nama || "Responden"} ({selectedSubmission.user?.instansi || "Dispora"})
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-brand-accent block text-xs">
                Form Terpilih:
              </span>
              <Badge variant="info">{selectedForm.label}</Badge>
            </div>
          </div>
        )}
      </Card>

      {/* Empty State bila dropdown belum lengkap */}
      {(!selectedSubmissionId || !selectedFormId) && (
        <Card className="p-12 text-center bg-white border border-gray-100 shadow-card rounded-3xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-brand-primary-light text-brand-primary flex items-center justify-center mx-auto">
            <Info className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-brand-text">
            Silakan pilih Kuesioner dan Form Excel terlebih dahulu
          </h3>
          <p className="text-xs sm:text-sm text-brand-text-secondary max-w-md mx-auto">
            Gunakan dua menu dropdown di atas untuk memilih kuesioner submisi responden dan jenis form excel yang divalidasi.
          </p>
        </Card>
      )}

      {/* Area Tampilan Preview Excel & Tabel Record */}
      {selectedSubmissionId && selectedFormId && (
        <Card className="p-6 bg-white border border-gray-100 shadow-card rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-brand-text flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Isi Record Data ({selectedForm?.label})</span>
              </h3>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Data ditarik dari file Excel database. Unggah berkas validasi (.pdf) untuk tiap baris record data.
              </p>
            </div>

            {/* Manual Excel File Input Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleExcelUpload(file);
                  }}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-brand-text transition-colors">
                  <UploadCloud className="w-4 h-4 text-brand-primary" />
                  <span>{activeFileName ? "Ganti File Excel Manual" : "Upload File Excel Manual"}</span>
                </span>
              </label>
            </div>
          </div>

          {/* Loading Indicator saat mengambil file dari Database */}
          {isLoadingExcel && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-brand-text">
                Mengambil dan membaca berkas Excel dari database...
              </p>
            </div>
          )}

          {/* Parse error message */}
          {!isLoadingExcel && parseError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Prompt jika tidak ada file di database & belum diunggah manual */}
          {!isLoadingExcel && !activeFileName && tableData.length === 0 && !parseError && (
            <div className="bg-emerald-50/60 border border-emerald-200/80 p-8 rounded-2xl text-center space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-950">
                  Tidak ada berkas Excel yang tersimpan di database untuk indikator ini
                </h4>
                <p className="text-xs text-emerald-800 max-w-lg mx-auto">
                  Submisi terpilih belum melampirkan file Excel untuk <strong>{selectedForm?.label}</strong>. Silakan pilih atau unggah file Excel secara manual untuk membaca record data.
                </p>
              </div>
              <label className="inline-block cursor-pointer pt-2">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleExcelUpload(file);
                  }}
                  className="hidden"
                />
                <Button variant="primary" size="md" className="gap-2">
                  <UploadCloud className="w-4 h-4" />
                  <span>Pilih Berkas Excel Manual ({selectedForm?.filename})</span>
                </Button>
              </label>
            </div>
          )}

          {/* Preview Tabel Excel & Button Upload Per Baris */}
          {!isLoadingExcel && tableData.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-brand-text-secondary">
                <span className="flex items-center gap-1.5">
                  Sumber Data:{" "}
                  {isFromDatabase ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      <Database className="w-3.5 h-3.5" /> File Database ({activeFileName})
                    </span>
                  ) : (
                    <span className="font-bold text-blue-700 flex items-center gap-1 bg-blue-100/80 px-2 py-0.5 rounded-md">
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Manual ({activeFileName})
                    </span>
                  )}
                </span>
                <Badge variant="success">Menampilkan {tableData.length} Baris Record</Badge>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-subtle">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-brand-text uppercase tracking-wider font-extrabold">
                      <th className="p-3.5 w-12 text-center border-r border-gray-200">No</th>
                      {tableHeaders.map((header, idx) => (
                        <th key={idx} className="p-3.5 border-r border-gray-200 min-w-[140px]">
                          {header}
                        </th>
                      ))}
                      <th className="p-3.5 min-w-[220px] text-center bg-brand-primary-light/50 text-brand-primary">
                        Aksi / Berkas Validasi (.pdf)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-brand-text">
                    {tableData.map((row, rowIndex) => {
                      const recordId = `row_${rowIndex}`;
                      const rowFile = rowValidationFiles[recordId];
                      const isUploading = uploadingRows[recordId];

                      return (
                        <tr
                          key={rowIndex}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="p-3.5 text-center font-bold text-gray-500 border-r border-gray-100">
                            {rowIndex + 1}
                          </td>
                          {tableHeaders.map((header, colIdx) => (
                            <td key={colIdx} className="p-3.5 border-r border-gray-100 truncate max-w-[250px]">
                              {row[header] !== undefined && row[header] !== null
                                ? String(row[header])
                                : "-"}
                            </td>
                          ))}

                          {/* Kolom Tombol Upload / Lihat / Ganti per-baris */}
                          <td className="p-3.5 text-center bg-brand-primary-light/10 min-w-[220px]">
                            {isUploading ? (
                              <div className="flex items-center justify-center gap-1.5 text-xs text-brand-primary font-semibold py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-brand-primary shrink-0" />
                                <span>Mengunggah...</span>
                              </div>
                            ) : rowFile ? (
                              <div className="flex flex-col items-center gap-1.5 py-1">
                                <Badge variant="success" className="gap-1 text-[11px] py-1 px-2.5 max-w-[200px]">
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="truncate" title={rowFile.fileName}>{rowFile.fileName}</span>
                                </Badge>
                                {rowFile.fileSize && (
                                  <span className="text-[10px] text-gray-500 font-medium">
                                    PDF ({rowFile.fileSize})
                                  </span>
                                )}
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewPdf(rowFile.fileUrl)}
                                    className="h-7 text-[11px] px-2.5 gap-1 border-brand-primary/30 text-brand-primary hover:bg-brand-primary-light"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Lihat</span>
                                  </Button>
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      accept=".pdf, application/pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleRowFileUpload(rowIndex, file);
                                        e.target.value = "";
                                      }}
                                      className="hidden"
                                    />
                                    <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200">
                                      <FileUp className="w-3 h-3 text-gray-600" />
                                      <span>Ganti</span>
                                    </span>
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label className="cursor-pointer inline-block py-1">
                                <input
                                  type="file"
                                  accept=".pdf, application/pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleRowFileUpload(rowIndex, file);
                                    e.target.value = "";
                                  }}
                                  className="hidden"
                                />
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-subtle">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload PDF</span>
                                </span>
                              </label>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
