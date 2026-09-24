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
              status: sub.status,
              createdAt: sub.createdAt,
              catatanVerifikator: sub.catatanVerifikator || null,
              responden: {
                namaLengkap: sub.user?.nama || currentUser?.nama || "Responden",
                kabupatenKota: "Kabupaten Kutai Kartanegara",
                pekerjaan: sub.user?.role === "ADMIN" ? "Administrator" : "Pengelola Cabang Olahraga",
                jenisKelamin: "-",
                umur: "-",
                kecamatan: "Tenggarong",
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
    return (
      sub.id.toLowerCase().includes(q) ||
      sub.responden.namaLengkap.toLowerCase().includes(q) ||
      sub.responden.kabupatenKota.toLowerCase().includes(q) ||
      sub.responden.pekerjaan.toLowerCase().includes(q)
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

      {/* Main Content: List & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of submissions */}
        <div className="lg:col-span-2 space-y-3">
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

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedId(sub.id)}
                  className={`bg-white rounded-2xl border p-5 shadow-card cursor-pointer transition-all duration-200 hover:border-brand-primary/50 ${
                    isSelected
                      ? "border-brand-primary ring-2 ring-brand-primary/10 shadow-elevated"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block tabular-nums">
                        {sub.id}
                      </span>
                      <h3 className="text-base font-bold text-brand-text">
                        {sub.responden.namaLengkap}
                      </h3>
                      <p className="text-xs text-brand-text-secondary mt-0.5">
                        {sub.responden.pekerjaan} • {sub.responden.kabupatenKota}
                      </p>
                    </div>

                    <Badge
                      variant={
                        sub.status === "TERVERIFIKASI"
                          ? "success"
                          : sub.status === "TERKIRIM"
                          ? "info"
                          : "warning"
                      }
                      className="shrink-0"
                    >
                      {sub.status === "TERVERIFIKASI" && "✓ Terverifikasi"}
                      {sub.status === "TERKIRIM" && "⏳ Menunggu Review"}
                      {sub.status === "PERLU_REVISI" && "⚠️ Perlu Revisi"}
                    </Badge>
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

        {/* Selected Submission Detail Panel */}
        <div className="lg:col-span-1">
          {activeDetail ? (
            <Card className="sticky top-24 space-y-4 border-emerald-100 bg-white shadow-elevated">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold">
                    Detail Submisi
                  </span>
                  <h3 className="text-sm font-bold text-brand-text tabular-nums">
                    {activeDetail.id}
                  </h3>
                </div>
                <Badge
                  variant={
                    activeDetail.status === "TERVERIFIKASI"
                      ? "success"
                      : activeDetail.status === "TERKIRIM"
                      ? "info"
                      : "warning"
                  }
                >
                  {activeDetail.status}
                </Badge>
              </div>

              {/* Status & Catatan Verifikator */}
              {activeDetail.catatanVerifikator && (
                <div className="bg-brand-surface rounded-xl p-3 border border-gray-100 text-xs">
                  <span className="font-bold text-brand-text block mb-1">
                    Catatan Verifikator Dispora:
                  </span>
                  <p className="text-brand-text-secondary leading-relaxed">
                    {activeDetail.catatanVerifikator}
                  </p>
                </div>
              )}

              {/* Identitas Ringkas */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-brand-text block">Data Responden:</span>
                <div className="bg-gray-50 p-3 rounded-xl space-y-1 text-gray-600">
                  <p>
                    <strong>Nama:</strong> {activeDetail.responden.namaLengkap} (
                    {activeDetail.responden.jenisKelamin}, {activeDetail.responden.umur} th)
                  </p>
                  <p>
                    <strong>Wilayah:</strong> {activeDetail.responden.kecamatan},{" "}
                    {activeDetail.responden.kabupatenKota}
                  </p>
                  <p>
                    <strong>Jabatan:</strong> {activeDetail.responden.pekerjaan}
                  </p>
                </div>
              </div>

              {/* Daftar Berkas Dokumen PDF Sah */}
              <div className="space-y-2">
                <span className="font-bold text-brand-text block text-xs">
                  Lampiran Berkas PDF Sah:
                </span>
                <div className="space-y-1.5">
                  {Object.values(activeDetail.answers || {})
                    .filter((a: any) => a && a.fileBuktiName)
                    .map((ans: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-xs flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-emerald-950 block truncate">
                            📄 {ans.fileBuktiName}
                          </span>
                          <span className="text-emerald-700 text-xs font-semibold">
                            {ans.fileBuktiSize || "PDF Sah"}
                          </span>
                        </div>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-10 text-xs text-gray-400">
              Pilih salah satu rekaman di samping untuk melihat rincian dokumen dan status verifikasi.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
