"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context/app-context";
import {
  History,
  FileCheck,
  Search,
  Calendar,
  User,
  ShieldCheck,
  ChevronRight,
  Clock,
  ArrowRight,
  X,
  AlertTriangle,
  Download,
} from "lucide-react";

export default function RiwayatPage() {
  const router = useRouter();
  const { submissions, currentUser, isLoading: isSessionLoading } = useApp();

  const [dataSubmissions, setDataSubmissions] = useState<any[]>(submissions);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Route protection & Fetch submissions dari backend API (HttpOnly Cookie)
  React.useEffect(() => {
    if (isSessionLoading) return;

    if (!currentUser) {
      router.push("/login");
      return;
    }

    async function fetchUserSubmissions() {
      try {
        const response = await fetch("/api/submissions");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.submissions) && data.submissions.length > 0) {
            const mapped = data.submissions.map((sub: any) => ({
              id: sub.id,
              noRegistrasi: sub.noRegistrasi,
              createdAt: sub.createdAt,
              user: sub.user,
              responden: {
                namaLengkap: sub.user?.nama || currentUser?.nama || "Responden",
                kabupatenKota: sub.user?.kabupatenKota || currentUser?.kabupatenKota || "Kabupaten Kutai Kartanegara",
                instansi: sub.user?.instansi || currentUser?.instansi || "-",
                jabatan: sub.user?.jabatan || currentUser?.jabatan || (sub.user?.role === "ADMIN" ? "Administrator" : "Pengelola Cabang Olahraga"),
                pekerjaan: sub.user?.jabatan || (sub.user?.role === "ADMIN" ? "Administrator" : "Pengelola Cabang Olahraga"),
              },
              answers: Array.isArray(sub.answers)
                ? sub.answers.reduce((acc: any, ans: any) => {
                  acc[ans.indicatorId] = ans;
                  return acc;
                }, {})
                : sub.answers || {},
            }));
            setDataSubmissions(mapped);
          }
        }
      } catch (err) {
        console.error("Gagal memuat riwayat submisi:", err);
      } finally {
        setIsFetchingData(false);
      }
    }

    fetchUserSubmissions();
  }, [isSessionLoading, currentUser, router]);

  if (isSessionLoading || !currentUser) {
    return null;
  }

  const displayList = dataSubmissions.length > 0 ? dataSubmissions : submissions;

  const filtered = displayList.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const instansi = (sub.responden?.instansi || sub.user?.instansi || "").toLowerCase();
    const jabatan = (sub.responden?.jabatan || sub.responden?.pekerjaan || sub.user?.jabatan || "").toLowerCase();
    return (
      sub.id.toLowerCase().includes(q) ||
      sub.responden.namaLengkap.toLowerCase().includes(q) ||
      sub.responden.kabupatenKota.toLowerCase().includes(q) ||
      instansi.includes(q) ||
      jabatan.includes(q)
    );
  });

  const activeDetail = displayList.find((s) => s.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text flex items-center gap-2">
            <History className="w-6 h-6 text-brand-primary" />
            <span>Riwayat Pengisian Kuesioner</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
            Pantau status verifikasi dan berkas bukti dukung yang telah Anda serahkan
          </p>
        </div>

        <Link href="/kuesioner">
          <Button variant="primary" size="md">
            <span>Isi Kuesioner Baru</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-card flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama responden, nomor registrasi, atau instansi..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs sm:text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
          />
        </div>
        <span className="text-xs text-gray-400 font-semibold tabular-nums shrink-0">
          {filtered.length} ditemukan
        </span>
      </div>

      {/* Main Content: Full-width List of Submissions */}
      <div className="w-full space-y-3">
        {filtered.length === 0 ? (
          <Card className="text-center py-12 text-xs text-brand-text-secondary">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-brand-text text-sm">Belum ada riwayat pengisian</p>
            <p className="text-xs text-gray-400 mt-1">
              Kuesioner yang telah Anda kirimkan akan muncul di daftar ini.
            </p>
          </Card>
        ) : (
          filtered.map((sub) => {
            const isSelected = sub.id === selectedId;
            const userInstansi = sub.responden?.instansi || sub.user?.instansi;
            const userJabatan = sub.responden?.jabatan || sub.user?.jabatan || sub.responden?.pekerjaan;

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedId(sub.id)}
                className={`bg-white rounded-2xl border p-5 shadow-card cursor-pointer transition-all duration-200 hover:border-brand-primary/50 ${isSelected
                    ? "border-brand-primary ring-2 ring-brand-primary/10 shadow-elevated"
                    : "border-gray-100"
                  }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-primary block mb-0.5">
                      No. Registrasi
                    </span>
                    <h3 className="text-base font-bold text-brand-text font-mono tracking-tight tabular-nums break-all">
                      {sub.noRegistrasi || sub.id}
                    </h3>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                    {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-brand-primary font-semibold flex items-center gap-1">
                    Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Detail Submisi */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-elevated border border-gray-100">
            {/* Header Modal */}
            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block mb-0.5">
                  No. Registrasi Submisi
                </span>
                <h3 className="text-base font-extrabold text-brand-text font-mono tabular-nums tracking-tight">
                  {activeDetail.noRegistrasi || activeDetail.id}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Modal (Scroll Container) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

              {/* Informasi Responden (Quick Summary) */}
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-3 text-xs">
                <h4 className="font-bold text-brand-text uppercase tracking-wider text-xs">
                  Informasi Responden
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 block">Nama Responden:</span>
                    <span className="font-bold text-brand-text">
                      {activeDetail.responden.namaLengkap}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Asal Wilayah:</span>
                    <span className="font-bold text-brand-text">
                      {activeDetail.responden.kabupatenKota}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Instansi:</span>
                    <span className="font-semibold text-brand-text">
                      {activeDetail.responden.instansi || activeDetail.user?.instansi || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Jabatan:</span>
                    <span className="font-semibold text-brand-text">
                      {activeDetail.responden.jabatan || activeDetail.user?.jabatan || activeDetail.responden.pekerjaan || "-"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block">Tanggal Pengiriman:</span>
                    <span className="font-semibold text-brand-text">
                      {new Date(activeDetail.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* List Berkas Bukti Dukung */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">
                  Lampiran Berkas Bukti Dukung:
                </h4>
                {Object.values(activeDetail.answers || {})
                  .filter((a: any) => a && (a.fileBuktiName || a.fileBuktiUrl))
                  .length === 0 ? (
                  <p className="text-amber-700 text-xs italic bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                    ⚠️ Tidak ada berkas lampiran pada submisi ini.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.values(activeDetail.answers || {})
                      .filter((a: any) => a && (a.fileBuktiName || a.fileBuktiUrl))
                      .map((ans: any, idx: number) => (
                        <div
                          key={idx}
                          className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs flex items-center justify-between gap-3"
                        >
                          <div className="truncate flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-emerald-950 block truncate">
                                {ans.fileBuktiName || "Dokumen_Bukti.xlsx"}
                              </span>
                              <span className="text-emerald-700 text-xs font-semibold">
                                {ans.fileBuktiSize || "Dokumen Bukti Sah"}
                              </span>
                            </div>
                          </div>
                          {ans.fileBuktiUrl && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = ans.fileBuktiUrl;
                                link.download = ans.fileBuktiName || "Dokumen_Bukti.xlsx";
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="shrink-0 text-xs h-8 px-3 gap-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh</span>
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

