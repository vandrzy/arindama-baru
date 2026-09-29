"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import { KABUPATEN_KOTA_OPTIONS } from "@/lib/constants/survey-data";
import * as XLSX from "xlsx";
import { fixWorksheetRange } from "@/lib/services/excelService";
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileUp,
  X,
  Loader2,
  Search,
  Download,
  Award,
  ShieldCheck,
  Hourglass,
  Clock,
  Trash2,
  RotateCcw,
  Check,
  FileText,
  Building2,
  MapPin,
  User,
  RefreshCw,
  AlertTriangle,
  Info,
  Filter,
  BarChart3,
} from "lucide-react";

// List 10 Kabupaten/Kota di Kaltim untuk Sebaran
const KALTIM_REGIONS = [
  { name: "Kota Samarinda", desc: "Ibukota Provinsi Kaltim" },
  { name: "Kota Balikpapan", desc: "Pintu Gerbang Kaltim" },
  { name: "Kutai Kartanegara", desc: "Tenggarong & Sekitarnya" },
  { name: "Kota Bontang", desc: "Wilayah Pesisir Timur" },
  { name: "Kabupaten Berau", desc: "Wilayah Pesisir Utara" },
  { name: "Kab. Kutai Timur", desc: "Sangatta & Sekitarnya" },
  { name: "Kabupaten Paser", desc: "Tanah Grogot & Sekitarnya" },
  { name: "Kab. Kutai Barat", desc: "Sendawar & Sekitarnya" },
  { name: "Penajam Paser Utara", desc: "Wilayah Penajam" },
  { name: "Mahakam Ulu", desc: "Wilayah Ujoh Bilang" },
];

export default function KuesionerPage() {
  const { currentUser, isLoading: isSessionLoading } = useApp();

  // Tab Active State: Indicator ID (1 - 8)
  const [activeIndicatorId, setActiveIndicatorId] = useState<number>(1);

  // Submissions & Database Records States
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [isFetchingSubmissions, setIsFetchingSubmissions] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWilayah, setSelectedWilayah] = useState<string>("");
  const [selectedTingkat, setSelectedTingkat] = useState<string>("");
  const [selectedMedali, setSelectedMedali] = useState<string>("");
  const [selectedStatusBerkas, setSelectedStatusBerkas] = useState<string>("");

  // Evidences state: key = `${submissionId}_ind${indicatorId}_row_${rowIndex}` -> evidence obj
  const [rowValidationFiles, setRowValidationFiles] = useState<
    Record<string, { id?: string; fileName: string; fileUrl: string; fileSize?: string; updatedAt?: string }>
  >({});
  const [uploadingEvidences, setUploadingEvidences] = useState<Record<string, boolean>>({});

  // PDF Preview Modal State
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>("");

  // Excel Upload State
  const [isUploadingExcel, setIsUploadingExcel] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Re-upload Excel Input Ref
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all submissions from backend
  const loadSubmissions = async () => {
    setIsFetchingSubmissions(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          setSubmissionsList(data.submissions);

          // Fetch all evidences for all submissions
          const newEvidencesMap: Record<string, any> = {};
          for (const sub of data.submissions) {
            for (let indId = 1; indId <= 8; indId++) {
              try {
                const evRes = await fetch(
                  `/api/validasi/evidences?submissionId=${encodeURIComponent(sub.id)}&formType=${indId}`
                );
                if (evRes.ok) {
                  const evData = await evRes.json();
                  if (evData.success && Array.isArray(evData.evidences)) {
                    evData.evidences.forEach((ev: any) => {
                      const key = `${sub.id}_ind${indId}_${ev.recordId}`;
                      newEvidencesMap[key] = ev;
                    });
                  }
                }
              } catch (e) {
                // ignore
              }
            }
          }
          setRowValidationFiles(newEvidencesMap);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil daftar kuesioner:", err);
    } finally {
      setIsFetchingSubmissions(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const currentIndicator = useMemo(() => {
    return SURVEY_INDICATORS.find((ind) => ind.id === activeIndicatorId) || SURVEY_INDICATORS[0];
  }, [activeIndicatorId]);

  // Aggregate all records for active indicator across submissions
  const allRecords = useMemo(() => {
    const list: any[] = [];
    const isUserRole = currentUser?.role === "RESPONDEN";

    submissionsList.forEach((sub) => {
      // If user is RESPONDEN, only include their own submissions
      if (isUserRole && sub.userId !== currentUser?.id) {
        return;
      }

      if (Array.isArray(sub.indicatorRecords)) {
        sub.indicatorRecords
          .filter((rec: any) => rec.indicatorId === activeIndicatorId)
          .forEach((rec: any, idx: number) => {
            const key = `${sub.id}_ind${activeIndicatorId}_row_${idx}`;
            const evidence = rowValidationFiles[key];

            list.push({
              ...rec,
              submissionId: sub.id,
              submissionNo: sub.noRegistrasi || sub.id,
              userNama: sub.user?.nama || "Responden",
              userEmail: sub.user?.email || "",
              userKabKota: sub.user?.kabupatenKota || sub.user?.instansi || "Kalimantan Timur",
              recordIndex: idx,
              evidenceKey: key,
              evidence: evidence || null,
              createdAt: rec.createdAt || sub.createdAt,
            });
          });
      }
    });

    return list;
  }, [submissionsList, activeIndicatorId, rowValidationFiles, currentUser]);

  // Filtered Records based on UI filters
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNama = rec.userNama.toLowerCase().includes(q);
        const matchKegiatan = rec.namaKegiatan?.toLowerCase().includes(q);
        const matchCabor = rec.cabangOlahraga?.toLowerCase().includes(q);
        if (!matchNama && !matchKegiatan && !matchCabor) return false;
      }

      // Filter Wilayah (Only applied for Admin if selected)
      if (currentUser?.role === "ADMIN" && selectedWilayah) {
        const userRegion = rec.userKabKota.toLowerCase();
        if (!userRegion.includes(selectedWilayah.toLowerCase())) return false;
      }

      // Filter Tingkat
      if (selectedTingkat) {
        if (!rec.tingkatPenyelenggaraan?.toLowerCase().includes(selectedTingkat.toLowerCase())) {
          return false;
        }
      }

      // Filter Medali (Only active for Indicator 1 & 6)
      if ((activeIndicatorId === 1 || activeIndicatorId === 6) && selectedMedali) {
        if (!rec.medali || !rec.medali.toLowerCase().includes(selectedMedali.toLowerCase())) {
          return false;
        }
      }

      // Filter Status Berkas
      if (selectedStatusBerkas) {
        if (selectedStatusBerkas === "sah" && !rec.evidence) return false;
        if (selectedStatusBerkas === "belum" && rec.evidence) return false;
        if (selectedStatusBerkas === "review" && rec.status !== "Menunggu Review") return false;
      }

      return true;
    });
  }, [allRecords, searchQuery, selectedWilayah, selectedTingkat, selectedMedali, selectedStatusBerkas, currentUser, activeIndicatorId]);

  // Stats calculation
  const totalEntries = allRecords.length;
  const verifiedEvidencesCount = allRecords.filter((r) => r.evidence).length;
  const pendingReviewCount = allRecords.filter((r) => r.status !== "Disetujui" && r.status !== "Sah").length;
  const verifiedPercentage = totalEntries > 0 ? Math.round((verifiedEvidencesCount / totalEntries) * 100) : 0;

  // Handle Excel file upload for current indicator
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingExcel(true);
    setUploadError(null);

    try {
      // Create or find submission for user
      let targetSubmissionId = submissionsList.find((s) => s.userId === currentUser?.id)?.id;

      if (!targetSubmissionId && submissionsList.length > 0) {
        targetSubmissionId = submissionsList[0].id;
      }

      const formData = new FormData();
      formData.append("file", file);

      if (targetSubmissionId) {
        formData.append("submissionId", targetSubmissionId);
        formData.append("formType", String(activeIndicatorId));

        const res = await fetch("/api/records/reupload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          const detailMsgs = Array.isArray(data.errors) ? data.errors.map((e: any) => e.message).join(" | ") : "";
          throw new Error(detailMsgs ? `${data.error}: ${detailMsgs}` : (data.error || "Gagal mengunggah file Excel."));
        }
      } else {
        // Create new submission with indicator file
        formData.append(`indicator_${activeIndicatorId}`, file);
        formData.append("tahunSurvei", String(new Date().getFullYear()));

        const res = await fetch("/api/submissions", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          const detailMsgs = Array.isArray(data.errors) ? data.errors.map((e: any) => e.message).join(" | ") : "";
          throw new Error(detailMsgs ? `${data.error}: ${detailMsgs}` : (data.error || "Gagal membuat submisi baru dari file Excel."));
        }
      }

      setNotification(`Berhasil mengunggah file Excel untuk Indikator-${String(activeIndicatorId).padStart(2, "0")}`);
      setTimeout(() => setNotification(null), 4000);
      await loadSubmissions();
    } catch (err: any) {
      console.error("Excel upload error:", err);
      setUploadError(err.message || "Gagal mengunggah file Excel.");
    } finally {
      setIsUploadingExcel(false);
      if (excelFileInputRef.current) {
        excelFileInputRef.current.value = "";
      }
    }
  };

  // Handle PDF Row File Upload
  const handlePdfUpload = async (record: any, file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Hanya berkas berekstensi .pdf yang diperbolehkan untuk bukti validasi.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file PDF melebihi batas maksimum 2 MB.");
      return;
    }

    const recordId = `row_${record.recordIndex}`;
    const key = record.evidenceKey;

    setUploadingEvidences((prev) => ({ ...prev, [key]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("submissionId", record.submissionId);
      formData.append("formType", String(activeIndicatorId));
      formData.append("recordId", recordId);
      formData.append("namaForm", `Indikator-${activeIndicatorId}`);

      const res = await fetch("/api/validasi/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah berkas PDF.");
      }

      setRowValidationFiles((prev) => ({
        ...prev,
        [key]: data.evidence,
      }));

      setNotification(`Berhasil mengunggah PDF validasi untuk baris data #${record.recordIndex + 1}`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error("Gagal unggah PDF:", err);
      alert(`Gagal unggah PDF: ${err.message || "Terjadi kesalahan"}`);
    } finally {
      setUploadingEvidences((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Download Template Excel
  const handleDownloadTemplate = () => {
    const isMedal = activeIndicatorId === 1 || activeIndicatorId === 6;
    let templateData: any[] = [];

    if (isMedal) {
      templateData = [
        {
          "Nama Kegiatan/ Kejuaraan Olahraga": "Kejuaraan Pelajar Tingkat Nasional 2026",
          "Cabang Olahraga": "Atletik",
          "Tingkat Penyelenggara": "Tk. Nasional",
          "Sumber Pendanaan": "APBD Kaltim",
          Medali: "Medali Emas",
          "Uraian Capaian": "Juara 1 Lari 100m Pelajar",
        },
      ];
    } else {
      templateData = [
        {
          "Nama Kegiatan/ Kejuaraan Olahraga": "Penataran Wasit/Juri Lisensi 2026",
          "Cabang Olahraga": "Renang",
          "Tingkat Penyelenggaraan": "Tk. Provinsi",
          "Sumber Pendanaan": "Dispora Kaltim",
          "Uraian Capaian": "Lulus sertifikasi wasit tingkat nasional",
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Indikator ${activeIndicatorId}`);
    XLSX.writeFile(wb, `Template_Indikator_${activeIndicatorId}.xlsx`);
  };

  // Calculate Indicator Distribution Data (Indikator 1 s.d. 8)
  const indicatorStats = useMemo(() => {
    const shortTitlesMap: Record<number, string> = {
      1: "Kejuaraan Pelajar",
      2: "Mutu SDM Olahraga",
      3: "Pelatih Berlisensi",
      4: "Database Wasit",
      5: "Wasit Bertugas",
      6: "Atlet Tim Nasional",
      7: "Event Keolahragaan",
      8: "Olahraga Rekreasi",
    };

    const targetSubmissions = submissionsList.filter((sub) => {
      if (currentUser?.role === "RESPONDEN") {
        return sub.userId === currentUser.id;
      }
      return true;
    });

    return SURVEY_INDICATORS.map((ind) => {
      let count = 0;
      let verified = 0;

      targetSubmissions.forEach((sub) => {
        if (Array.isArray(sub.indicatorRecords)) {
          sub.indicatorRecords
            .filter((rec: any) => rec.indicatorId === ind.id)
            .forEach((rec: any, idx: number) => {
              count += 1;
              const key = `${sub.id}_ind${ind.id}_row_${idx}`;
              if (rowValidationFiles[key]) {
                verified += 1;
              }
            });
        }
      });

      const percentage = count > 0 ? Math.round((verified / count) * 100) : 0;

      return {
        id: ind.id,
        codeStr: `Indikator-${String(ind.id).padStart(2, "0")}`,
        title: shortTitlesMap[ind.id] || ind.title,
        fullTitle: ind.title,
        count,
        verified,
        percentage,
      };
    });
  }, [submissionsList, rowValidationFiles, currentUser]);

  if (isSessionLoading || !currentUser) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Memuat data kuesioner...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={excelFileInputRef}
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleExcelUpload}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-elevated flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. BAGIAN TABS: PILIH KATEGORI EVALUASI (Indikator 1 - 8) */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
              PILIH KATEGORI EVALUASI
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Klik salah satu kategori untuk melihat rincian
          </span>
        </div>

        {/* Tab Buttons Horizontal Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {SURVEY_INDICATORS.map((ind) => {
            const isActive = ind.id === activeIndicatorId;
            const codeStr = `Indikator-${String(ind.id).padStart(2, "0")}`;
            const shortTitles: Record<number, string> = {
              1: "Kejuaraan Pelajar",
              2: "Mutu SDM Olahraga",
              3: "Pelatih Berlisensi",
              4: "Database Wasit",
              5: "Wasit Bertugas",
              6: "Atlet Tim Nasional",
              7: "Event Keolahragaan",
              8: "Olahraga Rekreasi",
            };

            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => setActiveIndicatorId(ind.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-150 group ${
                  isActive
                    ? "bg-[#04331d] text-white border-[#04331d] shadow-md scale-[1.02]"
                    : "bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-emerald-50/50 hover:border-emerald-200"
                }`}
              >
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-1.5 ${
                    isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-200/60 text-slate-500"
                  }`}
                >
                  {codeStr}
                </span>
                <span className={`text-xs font-bold leading-tight ${isActive ? "text-white" : "text-slate-800"}`}>
                  {shortTitles[ind.id] || ind.title}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2. CARD INFO KATEGORI / HEADER HIJAU TUA (Sesuai Referensi Gambar Desain) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#04331d] via-[#07482b] to-[#032615] text-white p-6 sm:p-10 shadow-elevated border border-emerald-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-4 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Indikator-{String(currentIndicator.id).padStart(2, "0")}
              </span>
              <span className="bg-emerald-900/60 text-emerald-200 border border-emerald-700/40 text-xs font-medium px-3 py-1 rounded-full">
                Olahraga Prestasi
              </span>
              <span className="bg-emerald-900/60 text-emerald-200 border border-emerald-700/40 text-xs font-medium px-3 py-1 rounded-full">
                Wilayah Provinsi Kaltim
              </span>
            </div>

            {/* Judul & Deskripsi */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {currentIndicator.title}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
                {currentIndicator.fullDesc}
              </p>
            </div>

            {/* Tags Info: Dasar Hukum & Target */}
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Dasar Hukum: <strong className="text-white font-semibold">Pedoman BAPOPSI &amp; Bidang Pembudayaan Prestasi Kaltim</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-xl">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Target: <strong className="text-white font-semibold">Minimal 20 Medali Pelajar/Tahun</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Unggah Excel & Unduh Format (Dua Tombol) */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 self-start lg:self-center">
            <Button
              type="button"
              disabled={isUploadingExcel}
              onClick={() => excelFileInputRef.current?.click()}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
            >
              {isUploadingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <UploadCloud className="w-4 h-4 text-slate-950" />
              )}
              <span>Unggah Excel Indikator-{String(activeIndicatorId).padStart(2, "0")}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="bg-emerald-950/60 hover:bg-emerald-900/80 text-white border-emerald-700/60 font-semibold text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Unduh Format Indikator-{String(activeIndicatorId).padStart(2, "0")}</span>
            </Button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-950/80 border border-red-700/60 rounded-2xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* 3. BARISAN CARD STATISTIK (Ringkasan Data) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeIndicatorId === 1 || activeIndicatorId === 6 ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-4`}>
        {/* Card 1: Total Submisi Entri */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submisi Entri</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalEntries} Entri</div>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tercatat se-Kalimantan Timur</span>
            </p>
          </div>
        </Card>

        {/* Card 2: Berkas Terverifikasi Sah */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Berkas Terverifikasi Sah</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{verifiedEvidencesCount} Berkas</div>
            <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
              <span>{verifiedPercentage}% memiliki dokumen sah</span>
            </p>
          </div>
        </Card>

        {/* Card 3: Menunggu Validasi */}
        <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Validasi</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pendingReviewCount} Berkas</div>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Perlu review verifikator Dispora</p>
          </div>
        </Card>

        {/* Card 4: Skor Indeks Kategori (HANYA UNTUK INDIKATOR 1 DAN 6) */}
        {(activeIndicatorId === 1 || activeIndicatorId === 6) && (
          <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Indeks Kategori</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">0.790</div>
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Kategori Indeks: Tinggi</span>
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* 4. FILTER TABLE & SEARCH BAR */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Input Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama peserta, cabor, atau kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Dropdown 1: Semua Wilayah Kaltim (HANYA UNTUK ROLE ADMIN) */}
          {currentUser?.role === "ADMIN" && (
            <select
              value={selectedWilayah}
              onChange={(e) => setSelectedWilayah(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600"
            >
              <option value="">Semua Wilayah Kaltim</option>
              {KABUPATEN_KOTA_OPTIONS.map((kab) => (
                <option key={kab} value={kab}>
                  {kab}
                </option>
              ))}
            </select>
          )}

          {/* Dropdown 2: Semua Tingkat */}
          <select
            value={selectedTingkat}
            onChange={(e) => setSelectedTingkat(e.target.value)}
            className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="">Semua Tingkat</option>
            <option value="Nasional">Tk. Nasional</option>
            <option value="Provinsi">Tk. Provinsi</option>
            <option value="Kabupaten">Tk. Kabupaten/Kota</option>
            <option value="Internasional">Tk. Internasional</option>
          </select>

          {/* Dropdown 3: Medali (HANYA TAMPIL PADA INDIKATOR 1 DAN 6) */}
          {(activeIndicatorId === 1 || activeIndicatorId === 6) && (
            <select
              value={selectedMedali}
              onChange={(e) => setSelectedMedali(e.target.value)}
              className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600 font-medium"
            >
              <option value="">Semua Medali</option>
              <option value="Emas">Medali Emas</option>
              <option value="Perak">Medali Perak</option>
              <option value="Perunggu">Medali Perunggu</option>
            </select>
          )}

          {/* Dropdown 4: Semua Status Berkas */}
          <select
            value={selectedStatusBerkas}
            onChange={(e) => setSelectedStatusBerkas(e.target.value)}
            className="px-3 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:border-emerald-600"
          >
            <option value="">Semua Status Berkas</option>
            <option value="sah">Sah &amp; Terverifikasi</option>
            <option value="belum">Belum Upload PDF</option>
            <option value="review">Menunggu Review</option>
          </select>

          {/* Button Reset Filter */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedWilayah("");
              setSelectedTingkat("");
              setSelectedMedali("");
              setSelectedStatusBerkas("");
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>
      </Card>

      {/* 5. TABEL DAFTAR SUBMISI DATA */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Daftar Submisi Indikator-{String(activeIndicatorId).padStart(2, "0")}: {currentIndicator.title}</span>
              </h3>
              <Badge variant="success" className="rounded-full px-3 text-[11px]">
                {filteredRecords.length} entri
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh catatan prestasi, SDM, dan kegiatan yang telah masuk dalam basis data resmi Kaltim.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => excelFileInputRef.current?.click()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Unggah Excel</span>
            </Button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isFetchingSubmissions ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Memuat data submisi dari database...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Belum ada data submisi terunggah</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Silakan unggah berkas Excel sesuai dengan template resmi untuk mengisikan data pada Indikator-{String(activeIndicatorId).padStart(2, "0")}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  <th className="py-3.5 px-4">PESERTA / RESPONDEN</th>
                  <th className="py-3.5 px-4">WILAYAH (KALTIM)</th>
                  <th className="py-3.5 px-4">CABOR &amp; KEGIATAN</th>
                  <th className="py-3.5 px-4">TINGKAT &amp; CAPAIAN</th>
                  {(activeIndicatorId === 1 || activeIndicatorId === 6) && (
                    <th className="py-3.5 px-4 text-center">BOBOT</th>
                  )}
                  <th className="py-3.5 px-4 text-center">DOKUMEN SAH</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {filteredRecords.map((rec, index) => {
                  const isUploadingPdf = uploadingEvidences[rec.evidenceKey];
                  const hasMedali = activeIndicatorId === 1 || activeIndicatorId === 6;

                  return (
                    <tr key={rec.id || index} className="hover:bg-slate-50/80 transition-colors">
                      {/* PESERTA / RESPONDEN */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-900">{rec.userNama}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Input: {new Date(rec.createdAt).toISOString().split("T")[0]}
                          </div>
                        </div>
                      </td>

                      {/* WILAYAH */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rec.userKabKota}</div>
                        <div className="text-[11px] text-slate-400">Kalimantan Timur</div>
                      </td>

                      {/* CABOR & KEGIATAN */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-bold text-slate-900">{rec.cabangOlahraga || "-"}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={rec.namaKegiatan}>
                          {rec.namaKegiatan || "-"}
                        </div>
                      </td>

                      {/* TINGKAT & CAPAIAN */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rec.tingkatPenyelenggaraan || "-"}</div>
                        {hasMedali && rec.medali && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            {rec.medali}
                          </span>
                        )}
                      </td>

                      {/* BOBOT */}
                      {(activeIndicatorId === 1 || activeIndicatorId === 6) && (
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                            {currentIndicator.bobotNilai * 20} pts
                          </span>
                        </td>
                      )}

                      {/* DOKUMEN SAH (PDF Upload & Preview Trigger) */}
                      <td className="py-3.5 px-4 text-center">
                        {isUploadingPdf ? (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                            <span>Mengunggah...</span>
                          </div>
                        ) : rec.evidence ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPreviewPdfUrl(`/api/files/download?url=${encodeURIComponent(rec.evidence.fileUrl)}`);
                                setPreviewPdfTitle(rec.evidence.fileName);
                              }}
                              className="h-8 text-[11px] px-3 gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="font-semibold truncate max-w-[110px]" title={rec.evidence.fileName}>
                                {rec.evidence.fileName}
                              </span>
                            </Button>

                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept=".pdf, application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handlePdfUpload(rec, file);
                                  e.target.value = "";
                                }}
                                className="hidden"
                              />
                              <span className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 block transition-colors">
                                <FileUp className="w-3.5 h-3.5" />
                              </span>
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-block">
                            <input
                              type="file"
                              accept=".pdf, application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePdfUpload(rec, file);
                                e.target.value = "";
                              }}
                              className="hidden"
                            />
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors">
                              <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
                              <span>Upload PDF</span>
                            </span>
                          </label>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                            rec.status === "Disetujui" || rec.status === "Sah"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rec.status === "Disetujui" || rec.status === "Sah"
                                ? "bg-emerald-600"
                                : "bg-amber-600"
                            }`}
                          />
                          {rec.status && rec.status !== "Sah & Terverifikasi" ? rec.status : "Menunggu Review"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 6. BAGIAN "SEBARAN CAPAIAN INDIKATOR" */}
      <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-extrabold text-slate-900">
                Sebaran Capaian Indikator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser?.role === "ADMIN"
                ? "Rekapitulasi keterisian dan data terverifikasi untuk 8 Indikator se-Kalimantan Timur."
                : "Rekapitulasi keterisian dan data terverifikasi untuk 8 Indikator dari data yang Anda inputkan."}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/80 self-start sm:self-center">
            {currentUser?.role === "ADMIN" ? "Seluruh Kalimantan Timur" : `Responden: ${currentUser?.nama || "User"}`}
          </span>
        </div>

        {/* Cards Grid 8 Indikator */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicatorStats.map((indStat) => {
            const isActive = indStat.id === activeIndicatorId;
            const badgeColor =
              indStat.percentage > 0
                ? indStat.percentage >= 80
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
                : "bg-slate-100 text-slate-600";
            const barColor =
              indStat.percentage >= 80
                ? "bg-emerald-600"
                : indStat.percentage >= 50
                ? "bg-blue-600"
                : "bg-amber-500";

            return (
              <div
                key={indStat.id}
                onClick={() => setActiveIndicatorId(indStat.id)}
                className={`p-4 rounded-2xl border space-y-3 cursor-pointer transition-all ${
                  isActive
                    ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-600/20 shadow-sm scale-[1.01]"
                    : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/70 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {indStat.codeStr}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 mt-1.5 line-clamp-1" title={indStat.fullTitle}>
                      {indStat.title}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                    {indStat.verified} Sah
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">
                      {indStat.verified} / {indStat.count} Terverifikasi
                    </span>
                    <span className="font-extrabold text-slate-900">{indStat.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${indStat.percentage}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 7. MODAL PRATINJAU PDF (PDF PREVIEW MODAL) */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={previewPdfTitle}>
                  Pratinjau Berkas Validasi: {previewPdfTitle}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Iframe / Object PDF Viewer */}
            <div className="w-full h-[550px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
              <iframe
                src={previewPdfUrl}
                className="w-full h-full rounded-2xl"
                title="Pratinjau PDF Validasi"
              />
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewPdfUrl(null)}
                className="rounded-xl text-xs font-semibold px-4"
              >
                Tutup Pratinjau
              </Button>
              <a
                href={previewPdfUrl}
                download={previewPdfTitle}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
