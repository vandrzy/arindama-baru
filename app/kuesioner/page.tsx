"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import { KABUPATEN_KOTA_OPTIONS } from "@/lib/constants/survey-data";
import * as XLSX from "xlsx";
import { fixWorksheetRange } from "@/lib/services/excelService";
import {
  FileSpreadsheet,
  Layers,
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
  ChevronLeft,
  ChevronRight,
  Database,
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

// Default Fallback Dynamic Weights Matrix
const DEFAULT_WEIGHTS = [
  { tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
];

function calculateRecordPoints(rec: any, dynamicWeightsList: any[]): number {
  if (!rec) return 0;
  const tingkatStr = (rec.tingkatPenyelenggaraan || "").toLowerCase();

  let targetPilar = "PRESTASI";
  if (rec.indicatorId === 2 || rec.indicatorId === 7) targetPilar = "DISABILITAS";
  if (rec.indicatorId === 3 || rec.indicatorId === 8) targetPilar = "REKREASI";

  let matchedRow = dynamicWeightsList.find((w: any) =>
    (w.pilar ? w.pilar === targetPilar : true) &&
    tingkatStr.includes((w.tingkat || "").toLowerCase())
  );
  if (!matchedRow) {
    matchedRow = dynamicWeightsList.find((w: any) =>
      (w.pilar ? w.pilar === targetPilar : true) && w.tingkat === "Provinsi"
    ) || {
      tingkat: "Provinsi",
      emas: 30,
      perak: 20,
      perunggu: 15,
      partisipasi: 10,
    };
  }

  const medaliStr = (rec.medali || "").toLowerCase();
  if (medaliStr.includes("emas")) return Number(matchedRow.emas);
  if (medaliStr.includes("perak")) return Number(matchedRow.perak);
  if (medaliStr.includes("perunggu")) return Number(matchedRow.perunggu);

  return Number(matchedRow.partisipasi);
}

export default function KuesionerPage() {
  const { currentUser, isLoading: isSessionLoading } = useApp();

  // Tab Active State: Indicator ID (1 - 8)
  const [activeIndicatorId, setActiveIndicatorId] = useState<number>(1);

  // Submissions & Database Records States
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [isFetchingSubmissions, setIsFetchingSubmissions] = useState<boolean>(true);

  // Dynamic Weights Matrix State
  const [dynamicWeights, setDynamicWeights] = useState<any[]>(DEFAULT_WEIGHTS);

  const loadDynamicWeights = async () => {
    try {
      const res = await fetch("/api/bobot-dinamis");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.weights) && data.weights.length > 0) {
          setDynamicWeights(data.weights);
        }
      }
    } catch (e) {
      console.error("Gagal mengambil data bobot dinamis:", e);
    }
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWilayah, setSelectedWilayah] = useState<string>("");
  const [selectedTingkat, setSelectedTingkat] = useState<string>("");
  const [selectedMedali, setSelectedMedali] = useState<string>("");
  const [selectedStatusBerkas, setSelectedStatusBerkas] = useState<string>("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Reset pagination when active indicator or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeIndicatorId, searchQuery, selectedWilayah, selectedTingkat, selectedMedali, selectedStatusBerkas]);

  // Evidences state: key = `${submissionId}_ind${indicatorId}_row_${rowIndex}` -> evidence obj
  const [rowValidationFiles, setRowValidationFiles] = useState<
    Record<string, { id?: string; fileName: string; fileUrl: string; fileSize?: string; updatedAt?: string }>
  >({});
  const [uploadingEvidences, setUploadingEvidences] = useState<Record<string, boolean>>({});

  // PDF Preview Modal State & Verification Selection
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>("");
  const [selectedRecordForVerification, setSelectedRecordForVerification] = useState<any | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showUploadExcelModal, setShowUploadExcelModal] = useState(false);
  const [respondensList, setRespondensList] = useState<any[]>([]);
  const [selectedUploadResponden, setSelectedUploadResponden] = useState<string>("");

  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    id: "",
    respondenNik: "",
    namaKegiatan: "",
    cabangOlahraga: "",
    tingkatPenyelenggaraan: "",
    medali: "",
    sumberPendanaan: "",
    uraianCapaian: "",
  });

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Yakin ingin menghapus entri kegiatan ini?")) return;
    try {
      const res = await fetch(`/api/records/manual?id=${recordId}`, { method: "DELETE" });
      if (res.ok) {
        setNotification("Entri berhasil dihapus.");
        setTimeout(() => setNotification(null), 4000);
        await loadSubmissions();
      } else {
        alert("Gagal menghapus entri.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat menghapus.");
    }
  };

  const handleManualSubmit = async () => {
    if (!manualFormData.respondenNik || !manualFormData.namaKegiatan || !manualFormData.cabangOlahraga || !manualFormData.tingkatPenyelenggaraan) {
      setUploadError("Mohon isi semua kolom yang bertanda bintang (*).");
      setTimeout(() => setUploadError(null), 4000);
      return;
    }
    setIsSubmittingManual(true);
    try {
      const res = await fetch("/api/records/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...manualFormData,
          indicatorId: activeIndicatorId
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification("Berhasil menambahkan entri kegiatan manual.");
        setTimeout(() => setNotification(null), 4000);
        setShowManualModal(false);
        setManualFormData({
          id: "",
          respondenNik: "",
          namaKegiatan: "",
          cabangOlahraga: "",
          tingkatPenyelenggaraan: "",
          medali: "",
          sumberPendanaan: "",
          uraianCapaian: "",
        });
        await loadSubmissions();
      } else {
        setUploadError(data.error || "Gagal menyimpan entri kegiatan.");
        setTimeout(() => setUploadError(null), 4000);
      }
    } catch (err: any) {
      console.error("Gagal simpan manual:", err);
      setUploadError("Terjadi kesalahan sistem saat menyimpan data.");
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Admin Verification Status Update Handler
  const handleUpdateVerificationStatus = async (recordId: string, newStatus: string) => {
    setUpdatingStatusId(recordId);
    try {
      const res = await fetch(`/api/admin/verifikasi/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`Status verifikasi berhasil diubah menjadi "${newStatus}"`);
        setTimeout(() => setNotification(null), 4000);

        if (selectedRecordForVerification && selectedRecordForVerification.id === recordId) {
          setSelectedRecordForVerification((prev: any) => (prev ? { ...prev, status: newStatus } : null));
        }

        await loadSubmissions();
      } else {
        setUploadError(data.error || "Gagal memperbarui status verifikasi.");
        setTimeout(() => setUploadError(null), 4000);
      }
    } catch (err: any) {
      console.error("Gagal update status verifikasi:", err);
      setUploadError("Terjadi kesalahan koneksi saat mengupdate status.");
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Excel Upload State & Warning Modal
  const [isUploadingExcel, setIsUploadingExcel] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Re-upload Excel Input Ref
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Trigger Excel Upload Handler
  const handleTriggerExcelUpload = () => {
    setShowUploadExcelModal(true);
  };

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

  const loadRespondens = async () => {
    try {
      const res = await fetch("/api/responden?limit=1000");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.responden)) {
          setRespondensList(data.responden);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil daftar responden:", err);
    }
  };

  useEffect(() => {
    loadSubmissions();
    loadDynamicWeights();
    loadRespondens();
  }, []);

  const currentIndicator = useMemo(() => {
    return SURVEY_INDICATORS.find((ind) => ind.id === activeIndicatorId) || SURVEY_INDICATORS[0];
  }, [activeIndicatorId]);

  // Aggregate all records for active indicator across submissions
  const allRecords = useMemo(() => {
    const list: any[] = [];
    const isUserRole = currentUser?.role === "OPERATOR";

    submissionsList.forEach((sub) => {
      // If user is OPERATOR, only include their own submissions
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
              userNama: sub.user?.nama || "Operator",
              userEmail: sub.user?.email || "",
              userKabKota: rec.responden?.kabupatenKota || sub.user?.kabupatenKota || sub.user?.instansi || "Kalimantan Timur",
              recordIndex: idx,
              evidenceKey: key,
              evidence: evidence || null,
              createdAt: rec.createdAt || sub.createdAt,
            });
          });
      }
    });

    // Sort by createdAt descending (newest first)
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
        if (!rec.medali) return false;
        const medaliLower = rec.medali.toLowerCase();
        const selLower = selectedMedali.toLowerCase();
        if (selLower === "partisipan") {
          if (!medaliLower.includes("partisip")) return false;
        } else {
          if (!medaliLower.includes(selLower)) return false;
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
  const pendingReviewCount = allRecords.filter((r) => r.status !== "Disetujui" && r.status !== "Sah" && r.status !== "Sah & Terverifikasi").length;
  const verifiedPercentage = totalEntries > 0 ? Math.round((verifiedEvidencesCount / totalEntries) * 100) : 0;

  // Total accumulated dynamic weight points for category card
  const totalCategoryPoints = useMemo(() => {
    return allRecords.reduce((sum, rec) => sum + calculateRecordPoints(rec, dynamicWeights), 0);
  }, [allRecords, dynamicWeights]);

  // Paginated records calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, startIndex, itemsPerPage]);

  // Handle Excel file upload for current indicator
  const handleExcelUpload = async (file: File) => {
    if (!file) return;

    if (!selectedUploadResponden) {
      setUploadError("Pilih responden terlebih dahulu.");
      return;
    }

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
      formData.append("respondenNik", selectedUploadResponden);

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
      setShowUploadExcelModal(false);
      await loadSubmissions();
    } catch (err: any) {
      console.error("Excel upload error:", err);
      setUploadError(err.message || "Gagal mengunggah file Excel.");
    } finally {
      setIsUploadingExcel(false);
    }
  };

  // Handle PDF Row File Upload
  const handlePdfUpload = async (record: any, file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Hanya berkas berekstensi .pdf yang diperbolehkan untuk bukti validasi.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert("Ukuran file PDF melebihi batas maksimum 15 MB.");
      return;
    }

    const recordId = `row_${record.recordIndex}`;
    const key = record.evidenceKey;

    setUploadingEvidences((prev) => ({ ...prev, [key]: true }));
    if (file.size > 1024 * 1024) {
      setNotification("Sedang mengompresi dokumen PDF menggunakan Ghostscript...");
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("respondenId", record.respondenId || record.submissionId);
      formData.append("submissionId", record.respondenId || record.submissionId);
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
      if (currentUser?.role === "OPERATOR") {
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
        <p className="text-sm font-semibold text-slate-700">Memuat berkas &amp; bukti sah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-elevated flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. BAGIAN TABS: PILIH KATEGORI EVALUASI (Indikator 1 - 8) */}
      <Card className="p-4 sm:p-6 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-black tracking-widest text-slate-800">
              PILIH KATEGORI EVALUASI
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            className="hidden sm:flex bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold text-xs px-4 py-2 rounded-xl items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Semua Format (ZIP)</span>
          </Button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
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
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border text-center transition-all duration-150 group h-full ${
                  isActive
                    ? "bg-[#0b1f18] text-white border-emerald-400 shadow-md ring-1 ring-emerald-400"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mb-2 border ${
                    isActive 
                      ? "bg-emerald-400 text-slate-900 border-emerald-400" 
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}
                >
                  INDIKATOR-{String(ind.id).padStart(2, "0")}
                </span>
                <span className={`text-xs sm:text-sm font-bold leading-tight ${isActive ? "text-white" : "text-slate-800"}`}>
                  {shortTitles[ind.id] || ind.title}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2. CARD INFO KATEGORI / HEADER HIJAU TUA (Sesuai Referensi Gambar Desain) */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#0b1f18] text-white p-6 sm:p-10 shadow-elevated border-none">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 relative z-10">
          <div className="space-y-5 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-emerald-400 text-slate-900 border-none text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
                INDIKATOR-{String(currentIndicator.id).padStart(2, "0")}
              </span>
              <span className="bg-white/10 text-emerald-50 border border-white/5 text-xs font-medium px-3 py-1 rounded-full">
                Olahraga Prestasi &amp; Pelajar
              </span>
            </div>

            {/* Judul & Deskripsi */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {currentIndicator.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                {currentIndicator.fullDesc}
              </p>
            </div>
          </div>

          {/* Action Buttons: Tambah Entri, Unggah Excel & Unduh Format (Tiga Tombol) */}
          <div className="flex flex-col gap-3 shrink-0 self-start lg:self-start w-full lg:w-64 pt-2">
            {currentUser?.role !== "ADMIN" && (
              <>
                <Button
                  type="button"
                  onClick={() => setShowManualModal(true)}
                  className="w-full bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-bold text-sm px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all border-none"
                >
                  <span className="text-lg leading-none mb-0.5">+</span>
                  <span>Tambah Entri Kegiatan</span>
                </Button>

                <Button
                  type="button"
                  disabled={isUploadingExcel}
                  onClick={handleTriggerExcelUpload}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-medium text-sm px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all"
                >
                  {isUploadingExcel ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <FileText className="w-4 h-4 text-white" />
                  )}
                  <span>Unggah Berkas Excel</span>
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full bg-white/5 hover:bg-white/10 text-emerald-300 font-medium text-sm px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-emerald-700/50 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Unduh Format Excel (INDIKATOR-{String(activeIndicatorId).padStart(2, "0")})</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Submisi Entri */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-4 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 capitalize">Total Submisi Entri</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-extrabold text-slate-900">{totalEntries}</div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-1">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Wilayah {selectedWilayah || "Semua"}</span>
            </p>
          </div>
        </Card>

        {/* Card 2: Berkas Terverifikasi Sah */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-4 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 capitalize">Berkas Terverifikasi Sah</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-extrabold text-slate-900">{verifiedEvidencesCount}</div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-1">
              <span className="font-bold text-emerald-600">{verifiedPercentage}%</span>
              <span>memiliki dokumen sah</span>
            </p>
          </div>
        </Card>

        {/* Card 3: Menunggu Validasi */}
        <Card className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-4 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 capitalize">Menunggu Validasi</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-4xl font-extrabold text-slate-900">{pendingReviewCount}</div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pt-1">
              Perlu review Dispora
            </p>
          </div>
        </Card>
      </div>

      {/* 4. FILTER TABLE & SEARCH BAR */}
      <Card className="p-5 bg-white border border-slate-100 shadow-sm rounded-3xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Input Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama operator, cabor, atau kegiatan..."
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
              <option value="partisipan">Partisipan</option>
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

          {currentUser?.role !== "ADMIN" && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Cetak Rekap</span>
              </Button>
            </div>
          )}
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
            <h4 className="text-sm font-bold text-slate-800">
              {allRecords.length > 0 || searchQuery || selectedWilayah || selectedTingkat || selectedMedali || selectedStatusBerkas
                ? "Data yang sesuai tidak ditemukan"
                : "Belum ada data submisi terunggah"}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {allRecords.length > 0 || searchQuery || selectedWilayah || selectedTingkat || selectedMedali || selectedStatusBerkas
                ? "Silakan coba ubah kata kunci pencarian atau sesuaikan opsi filter Anda."
                : `Silakan unggah berkas Excel sesuai dengan template resmi untuk mengisikan data pada Indikator-${String(activeIndicatorId).padStart(2, "0")}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  <th className="py-3.5 px-4">ATLET / RESPONDEN</th>
                  <th className="py-3.5 px-4">NAMA KEGIATAN</th>
                  <th className="py-3.5 px-4">{(activeIndicatorId === 1 || activeIndicatorId === 6) ? "JENJANG & CAPAIAN" : "JENJANG"}</th>
                  <th className="py-3.5 px-4">WILAYAH</th>
                  <th className="py-3.5 px-4 text-center">BUKTI PDF</th>
                  <th className="py-3.5 px-4 text-center">STATUS VALIDASI</th>
                  <th className="py-3.5 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                {paginatedRecords.map((rec, index) => {
                  const isUploadingPdf = uploadingEvidences[rec.evidenceKey];
                  const hasMedali = activeIndicatorId === 1 || activeIndicatorId === 6;
                  const isAdmin = currentUser?.role === "ADMIN";

                  return (
                    <tr key={rec.id || index} className="hover:bg-slate-50/80 transition-colors">
                      {/* ATLET / RESPONDEN */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-bold text-slate-900">{rec.responden?.nama || rec.userNama}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            NIK: {rec.responden?.nik || "-"}
                          </div>
                        </div>
                      </td>

                      {/* NAMA KEGIATAN */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-bold text-slate-900">{rec.namaKegiatan || "-"}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={rec.cabangOlahraga}>
                          {rec.cabangOlahraga || "-"}
                        </div>
                      </td>

                      {/* JENJANG & CAPAIAN */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rec.tingkatPenyelenggaraan || "-"}</div>
                        {hasMedali && rec.medali && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            {rec.medali}
                          </span>
                        )}
                      </td>

                      {/* WILAYAH */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rec.responden?.kabupatenKota || rec.userKabKota || "-"}</div>
                        <div className="text-[11px] text-slate-500">
                          {rec.responden?.kecamatan || "-"}
                        </div>
                      </td>

                      {/* DOKUMEN SAH (PDF Upload & Preview Trigger) */}
                      <td className="py-3.5 px-4 text-center">
                        {isUploadingPdf ? (
                          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-medium">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                            <span>Mengunggah...</span>
                          </div>
                        ) : isAdmin ? (
                          rec.evidence ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                              title={rec.evidence.fileName}
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[120px]">{rec.evidence.fileName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>Belum Upload</span>
                            </span>
                          )
                        ) : rec.evidence ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPreviewPdfUrl(`/api/files/download?url=${encodeURIComponent(rec.evidence.fileUrl)}`);
                                setPreviewPdfTitle(rec.evidence.fileName);
                                setSelectedRecordForVerification(rec);
                              }}
                              className="h-8 text-[11px] px-3 gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-xl font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="truncate max-w-[110px]" title={rec.evidence.fileName}>
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
                        {rec.status === "Sah & Terverifikasi" || rec.status === "Disetujui" || rec.status === "Sah" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sah &amp; Terverifikasi</span>
                          </span>
                        ) : rec.status === "Revisi" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Revisi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Hourglass className="w-3.5 h-3.5 text-amber-600" />
                            <span>Menunggu Review</span>
                          </span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="py-3.5 px-4 text-center flex items-center justify-center gap-2">
                        {/* Lihat PDF (Disable jika tidak ada evidence) */}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!rec.evidence}
                          onClick={() => {
                            if (rec.evidence) {
                              setPreviewPdfUrl(`/api/files/download?url=${encodeURIComponent(rec.evidence.fileUrl)}`);
                              setPreviewPdfTitle(rec.evidence.fileName);
                              setSelectedRecordForVerification(rec);
                            }
                          }}
                          className="h-8 w-8 p-0 rounded-xl border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Buka Berkas & Verifikasi Status"
                        >
                          <Eye className="w-4 h-4 text-emerald-700" />
                        </Button>

                        {/* Edit Button */}
                        {!isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setManualFormData({
                                  id: rec.id,
                                  respondenNik: rec.respondenNik || "",
                                  namaKegiatan: rec.namaKegiatan || "",
                                  cabangOlahraga: rec.cabangOlahraga || "",
                                  tingkatPenyelenggaraan: rec.tingkatPenyelenggaraan || "",
                                  medali: rec.medali || "",
                                  sumberPendanaan: rec.sumberPendanaan || "",
                                  uraianCapaian: rec.uraianCapaian || "",
                                });
                                setShowManualModal(true);
                              }}
                              className="h-8 w-8 p-0 rounded-xl border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-all shadow-xs"
                              title="Edit Entri"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
                            </Button>

                            {/* Hapus Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="h-8 w-8 p-0 rounded-xl border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 transition-all shadow-xs"
                              title="Hapus Entri"
                            >
                              <Trash2 className="w-4 h-4 text-rose-700" />
                            </Button>
                          </>
                        )}

                        {/* Admin Action: Verifikasi */}
                        {isAdmin && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={rec.status === "Sah & Terverifikasi" || rec.status === "Sah" || rec.status === "Disetujui" || updatingStatusId === rec.id}
                              onClick={() => handleUpdateVerificationStatus(rec.id, "Sah & Terverifikasi")}
                              className="h-8 w-8 p-0 rounded-xl border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Tandai Sah & Terverifikasi"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={rec.status === "Revisi" || updatingStatusId === rec.id}
                              onClick={() => handleUpdateVerificationStatus(rec.id, "Revisi")}
                              className="h-8 w-8 p-0 rounded-xl border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Tandai Revisi"
                            >
                              <AlertTriangle className="w-4 h-4 text-rose-700" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls Footer */}
        {!isFetchingSubmissions && filteredRecords.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> s.d.{" "}
              <strong className="text-slate-800">
                {Math.min(startIndex + itemsPerPage, filteredRecords.length)}
              </strong>{" "}
              dari <strong className="text-slate-800">{filteredRecords.length}</strong> entri data
            </div>

            <div className="flex items-center gap-1.5">
              {/* Button Previous */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Sebelumnya</span>
              </Button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    totalPages > 5 &&
                    Math.abs(page - currentPage) > 1 &&
                    page !== 1 &&
                    page !== totalPages
                  ) {
                    if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={page} className="px-1 text-slate-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-colors ${
                        currentPage === page
                          ? "bg-[#04331d] text-white shadow-sm"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Button Next */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="h-8 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <span className="hidden sm:inline mr-1">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>


      {/* 7. MODAL PRATINJAU PDF & VERIFIKASI */}
      <Modal isOpen={Boolean(previewPdfUrl || selectedRecordForVerification)}>
        <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-5 h-5 text-emerald-700 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={previewPdfTitle}>
                  Pratinjau Berkas Validasi: {previewPdfTitle || "Berkas Bukti"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPreviewPdfUrl(null);
                  setSelectedRecordForVerification(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Iframe PDF or Empty state */}
            {previewPdfUrl ? (
              <div className="w-full h-[550px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                <iframe
                  src={previewPdfUrl}
                  className="w-full h-full rounded-2xl"
                  title="Pratinjau PDF Validasi"
                />
              </div>
            ) : (
              <div className="w-full h-[320px] flex flex-col items-center justify-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-6 text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <h4 className="font-extrabold text-slate-800 text-sm">Belum Ada Berkas PDF Terunggah</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  Operator belum mengunggah dokumen bukti PDF untuk kegiatan ini. Anda dapat menetapkan status verifikasi di bawah ini.
                </p>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              {currentUser?.role === "ADMIN" && selectedRecordForVerification ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Verifikasi Berkas:</span>
                  <Button
                    type="button"
                    size="sm"
                    disabled={updatingStatusId === selectedRecordForVerification.id}
                    onClick={() => handleUpdateVerificationStatus(selectedRecordForVerification.id, "Revisi")}
                    className={`h-8 text-xs font-bold px-3 rounded-xl gap-1.5 transition-all ${
                      selectedRecordForVerification.status === "Revisi"
                        ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-300"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Tandai Revisi</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    disabled={updatingStatusId === selectedRecordForVerification.id}
                    onClick={() =>
                      handleUpdateVerificationStatus(selectedRecordForVerification.id, "Sah & Terverifikasi")
                    }
                    className={`h-8 text-xs font-bold px-3 rounded-xl gap-1.5 transition-all ${
                      selectedRecordForVerification.status === "Sah & Terverifikasi" ||
                      selectedRecordForVerification.status === "Sah" ||
                      selectedRecordForVerification.status === "Disetujui"
                        ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-300"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sah &amp; Terverifikasi</span>
                  </Button>
                </div>
              ) : selectedRecordForVerification && (
                <div className="flex items-center">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors">
                    <input
                      type="file"
                      accept=".pdf, application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePdfUpload(selectedRecordForVerification, file);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    <UploadCloud className="w-3.5 h-3.5 text-amber-700" />
                    <span>Ganti File PDF</span>
                  </label>
                </div>
              )}

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setSelectedRecordForVerification(null);
                  }}
                  className="rounded-xl text-xs font-semibold px-4 h-8"
                >
                  Tutup Pratinjau
                </Button>
                {previewPdfUrl && (
                  <a
                    href={previewPdfUrl}
                    download={previewPdfTitle}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 h-8 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh File</span>
                  </a>
                )}
              </div>
            </div>
          </div>
      </Modal>
      {/* 9. MODAL FORM MANUAL TAMBAH/EDIT ENTRI */}
      <Modal isOpen={showManualModal} onClose={() => setShowManualModal(false)}>
        <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Entri Kegiatan Manual</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
              <div className="p-6 pt-2 space-y-4 overflow-y-auto custom-scrollbar">
              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium flex gap-2 items-start mt-2 pb-2">
                  <div className="break-words w-full">
                    <p className="opacity-90">{uploadError}</p>
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pilih Responden *</label>
                <select
                  value={manualFormData.respondenNik}
                  onChange={(e) => setManualFormData({ ...manualFormData, respondenNik: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="" disabled>Pilih Responden...</option>
                  {respondensList.map((r) => (
                    <option key={r.nik} value={r.nik}>
                      {r.nama} - NIK: {r.nik}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Kegiatan / Ajang Kejuaraan *</label>
                <input 
                  type="text" 
                  value={manualFormData.namaKegiatan}
                  onChange={(e) => setManualFormData({ ...manualFormData, namaKegiatan: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Cabang Olahraga *</label>
                  <input 
                    type="text" 
                    value={manualFormData.cabangOlahraga}
                    onChange={(e) => setManualFormData({ ...manualFormData, cabangOlahraga: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tingkat Penyelenggara *</label>
                  <select 
                    value={manualFormData.tingkatPenyelenggaraan}
                    onChange={(e) => setManualFormData({ ...manualFormData, tingkatPenyelenggaraan: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  >
                    <option value="" disabled>Pilih Opsi...</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
              </div>

              {(activeIndicatorId === 1 || activeIndicatorId === 6) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Capaian Medali *</label>
                    <select 
                      value={manualFormData.medali}
                      onChange={(e) => setManualFormData({ ...manualFormData, medali: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    >
                      <option value="" disabled>Pilih Opsi...</option>
                      <option value="Emas">Emas</option>
                      <option value="Perak">Perak</option>
                      <option value="Perunggu">Perunggu</option>
                      <option value="Partisipasi">Partisipasi</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Sumber Pendanaan *</label>
                    <select 
                      value={manualFormData.sumberPendanaan}
                      onChange={(e) => setManualFormData({ ...manualFormData, sumberPendanaan: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    >
                      <option value="" disabled>Pilih Opsi...</option>
                      <option value="APBD (Daerah)">APBD (Daerah)</option>
                      <option value="APBN (Pusat/Kemenpora)">APBN (Pusat/Kemenpora)</option>
                      <option value="Swasta / Sponsorship">Swasta / Sponsorship</option>
                      <option value="Kombinasi (Pemerintah & Swasta)">Kombinasi (Pemerintah & Swasta)</option>
                      <option value="Mandiri">Mandiri</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700">Uraian Capaian</label>
                 <textarea 
                    rows={3} 
                    value={manualFormData.uraianCapaian}
                    onChange={(e) => setManualFormData({ ...manualFormData, uraianCapaian: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" 
                    placeholder="Masukkan detail capaian..."
                 ></textarea>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="text-xs font-bold text-slate-700">Berkas Bukti Fisik PDF (Opsional)</label>
                <input type="file" accept=".pdf" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
              </div>
            </div>
            
            <div className="p-6 pt-4 border-t border-slate-100 shrink-0 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowManualModal(false)}>Batal</Button>
              <Button 
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-70"
                disabled={isSubmittingManual}
                onClick={handleManualSubmit}
              >
                {isSubmittingManual ? "Menyimpan..." : "Simpan Entri Kegiatan"}
              </Button>
            </div>
          </div>
      </Modal>


      {/* 9. MODAL UNGGAH EXCEL */}
      <Modal isOpen={showUploadExcelModal} onClose={() => setShowUploadExcelModal(false)}>
        <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Unggah File Excel</h3>
                  <p className="text-xs text-slate-500">Isi otomatis data Indikator-{String(activeIndicatorId).padStart(2, "0")}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadExcelModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 pt-2 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pilih Responden *</label>
                <select
                  value={selectedUploadResponden}
                  onChange={(e) => setSelectedUploadResponden(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="" disabled>Pilih Responden...</option>
                  {respondensList.map((r) => (
                    <option key={r.id} value={r.nik}>
                      {r.nama} - NIK: {r.nik}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area Dropzone */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">Dokumen Template Excel *</label>
                <div 
                  className="w-full border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-emerald-50 transition-colors cursor-pointer group"
                  onClick={() => excelFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleExcelUpload(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    type="file"
                    ref={excelFileInputRef}
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleExcelUpload(e.target.files[0]);
                    }}
                  />
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 mb-1">Pilih atau Tarik File Excel ke Sini</span>
                  <span className="text-[10px] text-slate-500">Maks. 10MB (.xlsx, .xls)</span>
                </div>
              </div>

              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium flex gap-2 items-start mt-2 pb-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="break-words w-full">
                    <p className="font-bold mb-1">Gagal Validasi / Unggah:</p>
                    <p className="opacity-90">{uploadError}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 pt-4 border-t border-slate-100 shrink-0 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUploadExcelModal(false)}>Tutup</Button>
            </div>
          </div>
      </Modal>
    </div>
  );
}
