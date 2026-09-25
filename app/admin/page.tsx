"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import { SurveySubmission } from "@/lib/types";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  FileSpreadsheet,
  FileCheck,
  Search,
  Eye,
  Filter,
  Users,
  Award,
  BarChart3,
  ExternalLink,
  Check,
  X,
  Printer,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { submissions, updateSubmissionStatus, currentUser, role, isLoading } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingSubmission, setVerifyingSubmission] = useState<SurveySubmission | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [previewingPdfDoc, setPreviewingPdfDoc] = useState<{
    name: string;
    title: string;
    size?: string;
    hash?: string;
  } | null>(null);

  const [dbSubmissions, setDbSubmissions] = useState<SurveySubmission[]>([]);
  const [isFetchingDb, setIsFetchingDb] = useState(true);

  // Route protection & fetch submissions dari database API (/api/admin/submissions)
  React.useEffect(() => {
    if (isLoading) return;

    if (!currentUser || role !== "ADMIN") {
      router.push("/login");
      return;
    }

    async function fetchAdminSubmissions() {
      try {
        const response = await fetch("/api/admin/submissions");
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.submissions)) {
            const mapped: SurveySubmission[] = data.submissions.map((sub: any) => ({
              id: sub.id,
              createdAt: sub.createdAt,
              tahunSurvei: sub.tahunSurvei,
              status: sub.status,
              catatanVerifikator: sub.catatanVerifikator || "",
              totalIndikatorTerisi:
                sub.totalIndikatorTerisi ||
                (Array.isArray(sub.answers) ? sub.answers.length : 0),
              user: sub.user
                ? {
                    nama: sub.user.nama,
                    instansi: sub.user.instansi || "",
                    kabupatenKota: sub.user.kabupatenKota || "",
                  }
                : undefined,
              responden: {
                namaLengkap: sub.user?.nama || "Responden",
                kabupatenKota: sub.user?.kabupatenKota || "-",
                kecamatan: "-",
                pekerjaan: sub.user?.instansi || "Pengelola Olahraga",
                umur: "-",
                jenisKelamin: "",
                nomorTelepon: "-",
              },
              answers: Array.isArray(sub.answers)
                ? sub.answers.reduce((acc: any, ans: any) => {
                    acc[ans.indicatorId] = ans;
                    return acc;
                  }, {})
                : sub.answers || {},
            }));
            setDbSubmissions(mapped);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data submissions dari database:", err);
      } finally {
        setIsFetchingDb(false);
      }
    }

    fetchAdminSubmissions();
  }, [isLoading, currentUser, role, router]);

  // Keyboard Navigation: Escape to close active modal/viewer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewingPdfDoc) {
          setPreviewingPdfDoc(null);
        } else if (verifyingSubmission) {
          setVerifyingSubmission(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewingPdfDoc, verifyingSubmission]);

  if (isLoading || !currentUser || role !== "ADMIN") {
    return null;
  }

  const activeSubmissions = dbSubmissions;

  // Filtered submissions
  const filteredSubmissions = activeSubmissions.filter((sub) => {
    const matchesStatus = filterStatus === "ALL" || sub.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const nama = (sub.user?.nama || sub.responden.namaLengkap).toLowerCase();
    const instansi = (sub.user?.instansi || "").toLowerCase();
    const kab = (sub.user?.kabupatenKota || sub.responden.kabupatenKota).toLowerCase();

    const matchesSearch =
      sub.id.toLowerCase().includes(q) ||
      nama.includes(q) ||
      instansi.includes(q) ||
      kab.includes(q);
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const totalSubmissions = activeSubmissions.length;
  const verifiedCount = activeSubmissions.filter((s) => s.status === "TERVERIFIKASI").length;
  const pendingCount = activeSubmissions.filter((s) => s.status === "TERKIRIM").length;
  const revisionCount = activeSubmissions.filter((s) => s.status === "PERLU_REVISI").length;

  const handleOpenVerification = (sub: SurveySubmission) => {
    setVerifyingSubmission(sub);
    setVerificationNote(sub.catatanVerifikator || "");
    setPreviewingPdfDoc(null);
  };

  const handleApplyStatus = async (newStatus: SurveySubmission["status"]) => {
    if (!verifyingSubmission) return;

    try {
      await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: verifyingSubmission.id,
          status: newStatus,
          catatanVerifikator: verificationNote,
        }),
      });
    } catch (err) {
      console.error("Gagal meng-update status ke database:", err);
    }

    setDbSubmissions((prev) =>
      prev.map((s) =>
        s.id === verifyingSubmission.id
          ? { ...s, status: newStatus, catatanVerifikator: verificationNote }
          : s
      )
    );
    updateSubmissionStatus(verifyingSubmission.id, newStatus, verificationNote);
    setSuccessToast(`Status submisi ${verifyingSubmission.id} berhasil diperbarui menjadi ${newStatus}.`);
    setVerifyingSubmission(null);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleBulkApprove = async () => {
    for (const id of selectedSubmissions) {
      try {
        await fetch("/api/admin/submissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: "TERVERIFIKASI",
            catatanVerifikator: "Disetujui melalui verifikasi massal Dispora.",
          }),
        });
      } catch (err) {
        console.error("Gagal verifikasi massal id:", id, err);
      }
    }

    setDbSubmissions((prev) =>
      prev.map((item) =>
        selectedSubmissions.includes(item.id)
          ? { ...item, status: "TERVERIFIKASI", catatanVerifikator: "Disetujui melalui verifikasi massal Dispora." }
          : item
      )
    );
    selectedSubmissions.forEach((id) => {
      updateSubmissionStatus(id, "TERVERIFIKASI", "Disetujui melalui verifikasi massal Dispora.");
    });
    setSuccessToast(`${selectedSubmissions.length} submisi berhasil diverifikasi sah.`);
    setSelectedSubmissions([]);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-5 z-50 bg-emerald-800 text-white px-5 py-3 rounded-xl shadow-elevated text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4 text-brand-accent" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-brand-accent-hover" />
            <span>PORTAL VERIFIKATOR RESMI KEOLAHRAGAAN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
            Admin Command Center &amp; Verifikasi
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
            Validasi dokumen bukti sah dan audit jawaban responden daerah.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards (Clean, Semantic, Tabular Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Submisi
            </span>
            <Users className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-3xl font-extrabold text-brand-text tabular-nums">
            {totalSubmissions}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">
            Kuesioner tercatat di sistem
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-card bg-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Terverifikasi Sah
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-900 tabular-nums">
            {verifiedCount}
          </p>
          <span className="text-xs text-emerald-700 mt-1 block">
            Dokumen SK &amp; medali valid
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-card bg-blue-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Menunggu Review
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-blue-900 tabular-nums">
            {pendingCount}
          </p>
          <span className="text-xs text-blue-700 mt-1 block">
            Perlu pemeriksaan verifikator
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-card bg-amber-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Perlu Revisi
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-900 tabular-nums">
            {revisionCount}
          </p>
          <span className="text-xs text-amber-700 mt-1 block">
            Lampiran bukti belum sah
          </span>
        </div>
      </div>

      {/* Main Table: Verifikasi & Audit Jawaban Responden */}
      <Card className="overflow-hidden p-0 border-gray-200">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-brand-surface/40">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama responden / instansi..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs focus:border-brand-primary outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
              {[
                { id: "ALL", label: "Semua" },
                { id: "TERKIRIM", label: "Perlu Review" },
                { id: "TERVERIFIKASI", label: "Terverifikasi" },
                { id: "PERLU_REVISI", label: "Revisi" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    filterStatus === tab.id
                      ? "bg-white text-brand-text shadow-sm"
                      : "text-gray-500 hover:text-brand-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase font-bold tracking-wider text-xs">
              <tr>
                <th className="py-3.5 pl-4 sm:pl-6 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredSubmissions.length > 0 &&
                      selectedSubmissions.length === filteredSubmissions.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSubmissions(filteredSubmissions.map((s) => s.id));
                      } else {
                        setSelectedSubmissions([]);
                      }
                    }}
                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Instansi</th>
                <th className="py-3.5 px-4">Kabupaten/Kota</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Tidak ada rekaman yang sesuai dengan pencarian atau filter status.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isChecked = selectedSubmissions.includes(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-brand-surface/70 transition-colors group ${
                        isChecked ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <td className="py-4 pl-4 sm:pl-6 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubmissions((prev) => [...prev, sub.id]);
                            } else {
                              setSelectedSubmissions((prev) =>
                                prev.filter((id) => id !== sub.id)
                              );
                            }
                          }}
                          className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4 font-semibold text-brand-text tabular-nums text-sm">
                        {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-4 font-bold text-brand-text text-sm">
                        {sub.user?.nama || sub.responden.namaLengkap}
                      </td>

                      <td className="py-4 px-4 text-brand-text text-sm">
                        {sub.user?.instansi || "-"}
                      </td>

                      <td className="py-4 px-4 text-brand-text text-sm">
                        <span className="font-semibold block">
                          {sub.user?.kabupatenKota || sub.responden.kabupatenKota}
                        </span>
                      </td>

                      <td className="py-4 px-4">
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
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleOpenVerification(sub)}
                          className="gap-1 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit Berkas</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal / Dialog Audit & Verifikasi Berkas Fisik Excell Sah */}
      {verifyingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-elevated border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Pemeriksaan Berkas Sah
                </span>
                <h3 className="text-xl font-extrabold text-brand-text">
                  Verifikasi Submisi: {verifyingSubmission.id}
                </h3>
              </div>
              <button
                onClick={() => setVerifyingSubmission(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Responden Quick Summary */}
              <div className="bg-brand-surface rounded-2xl p-4 border border-gray-100 text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block">Nama Responden:</span>
                  <span className="font-bold text-brand-text">
                    {verifyingSubmission.responden.namaLengkap}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Asal Wilayah:</span>
                  <span className="font-bold text-brand-text">
                    {verifyingSubmission.responden.kabupatenKota}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Instansi:</span>
                  <span className="font-semibold text-brand-text">
                    {verifyingSubmission.user?.instansi || verifyingSubmission.responden.instansi || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Jabatan:</span>
                  <span className="font-semibold text-brand-text">
                    {verifyingSubmission.user?.jabatan || verifyingSubmission.responden.jabatan || verifyingSubmission.responden.pekerjaan || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status Saat Ini:</span>
                  <Badge variant="info">{verifyingSubmission.status}</Badge>
                </div>
              </div>

              {/* List of Attached Excell Evidence */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">
                  Pemeriksaan Dokumen Pendukung (Dokumen Excell):
                </h4>

                {Object.values(verifyingSubmission.answers).map((ans, idx) => {
                  const getIndicatorTitle = () => {
                    if (ans.indicatorId === 0) return "Data Diri & Afiliasi Responden";
                    const matched = SURVEY_INDICATORS.find((i) => i.id === ans.indicatorId);
                    const titleText = matched ? matched.title : ans.indicatorTitle || "";
                    return `Indikator ${ans.indicatorId}: ${titleText}`;
                  };

                  return (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-xl p-3.5 text-xs space-y-2 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-primary text-xs">
                          {getIndicatorTitle()}
                        </span>
                      </div>

                      <div className="text-gray-700 font-semibold text-xs pt-1">
                        Dokumen Excell:
                      </div>

                      {ans.fileBuktiUrl || ans.fileBuktiName ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
                          <div className="truncate">
                            <span className="font-bold text-emerald-950 block truncate">
                              📊 {ans.fileBuktiName || "Dokumen_Excell.xlsx"} ({ans.fileBuktiSize || "Dokumen Excell"})
                            </span>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const downloadUrl = ans.fileBuktiUrl || "#";
                              const link = document.createElement("a");
                              link.href = downloadUrl;
                              link.download = ans.fileBuktiName || "Dokumen_Excell.xlsx";
                              link.target = "_blank";
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="shrink-0 text-xs h-7 px-2.5 gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </Button>
                        </div>
                      ) : (
                        <p className="text-amber-700 text-xs italic">
                          ⚠️ Responden belum melampirkan berkas bukti Excell untuk indikator ini.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Catatan Verifikator Dispora */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Catatan Pemeriksaan Verifikator:
                </label>
                <textarea
                  rows={3}
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  placeholder="Tuliskan catatan verifikasi (misal: 'Semua dokumen SK dan piagam terbukti sah dan stempel jelas' atau 'Mohon unggah ulang SK penugasan resmi')..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:border-brand-primary outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons (Footer) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50/50 shrink-0">
              <span className="text-xs text-gray-400">
                Pintasan: tekan <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-semibold tracking-wider">Esc</kbd> untuk menutup
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setVerifyingSubmission(null)}
                >
                  Tutup
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleApplyStatus("PERLU_REVISI")}
                  className="bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Minta Revisi Responden</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleApplyStatus("TERVERIFIKASI")}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Setujui &amp; Verifikasi Sah</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Official PDF Document Viewer Modal */}
      {previewingPdfDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-elevated border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Document Header */}
            <div className="bg-brand-primary text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <FileCheck className="w-4 h-4 text-white" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold truncate">{previewingPdfDoc.name}</h3>
                  <span className="text-xs text-emerald-200 block truncate">
                    {previewingPdfDoc.title} • {previewingPdfDoc.size || "1.8 MB"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPreviewingPdfDoc(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Simulated Official Physical Document Page */}
            <div className="p-6 sm:p-8 bg-brand-surface overflow-y-auto space-y-6">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-gray-200 space-y-5 relative">
                {/* Official Dispora Header */}
                <div className="text-center pb-4 border-b-2 border-brand-primary/40 space-y-1">
                  <p className="text-xs uppercase tracking-widest font-bold text-gray-500">
                    PEMERINTAH DAERAH • DINAS PEMUDA DAN OLAHRAGA
                  </p>
                  <h4 className="text-sm font-extrabold text-brand-text">
                    SURAT KEPUTUSAN &amp; PIAGAM PENETAPAN PRESTASI
                  </h4>
                  <p className="text-xs text-gray-500 tabular-nums">
                    Nomor: 426/DISPORA-KEJURNAS/2024
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-3 text-xs leading-relaxed text-brand-text">
                  <p>
                    Menimbang bahwa berdasarkan hasil evaluasi kuesioner keolahragaan resmi,
                    atlet/kontingen yang bersangkutan dinyatakan sah mewakili daerah dan telah
                    memenuhi ketentuan indikator pencapaian nasional/internasional tahun berjalan.
                  </p>
                  <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 text-xs text-gray-700">
                    <p><strong>Nama Berkas:</strong> {previewingPdfDoc.name}</p>
                    <p><strong>Status Dokumen:</strong> <span className="text-emerald-700 font-bold">SAH &amp; TERVERIFIKASI FISIK</span></p>
                    {previewingPdfDoc.hash && (
                      <p className="text-xs tabular-nums tracking-wider font-semibold break-all text-emerald-800">
                        <strong>Integritas SHA256:</strong> {previewingPdfDoc.hash}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stamp & Signature */}
                <div className="pt-4 flex items-end justify-between text-xs">
                  <div className="inline-flex flex-col items-center border-2 border-emerald-600 rounded-xl p-2.5 text-emerald-800 rotate-[-6deg] bg-emerald-50/50">
                    <span className="text-xs uppercase font-bold tracking-wider">DISPORA DAERAH</span>
                    <span className="text-sm font-extrabold tracking-wide">VERIFIKASI SAH</span>
                    <span className="text-xs font-medium">TGL: 20 MEI 2024</span>
                  </div>

                  <div className="text-right space-y-0.5">
                    <span className="text-xs text-gray-400 block">Pejabat Berwenang,</span>
                    <span className="font-bold block pt-8 text-brand-text underline">
                      Drs. H. Hendra Wijaya, M.Si.
                    </span>
                    <span className="text-xs text-gray-500 block">NIP. 19780412 200212 1 004</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Viewer Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Pintasan: <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-semibold tracking-wider">Esc</kbd>
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPreviewingPdfDoc(null)}
              >
                Selesai Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedSubmissions.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-brand-text text-white px-5 py-3 rounded-2xl shadow-elevated border border-gray-700 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <span className="text-xs font-semibold tabular-nums">
            {selectedSubmissions.length} submisi dipilih
          </span>
          <Button
            size="sm"
            variant="gold"
            onClick={handleBulkApprove}
            className="shadow-subtle gap-1.5 text-xs font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Setujui Semua Terpilih</span>
          </Button>
          <button
            onClick={() => setSelectedSubmissions([])}
            className="text-xs text-gray-400 hover:text-white underline underline-offset-2"
          >
            Batal
          </button>
        </div>
      )}
    </div>
  );
}
