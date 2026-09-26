"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import { SURVEY_INDICATORS } from "@/lib/constants/survey-data";
import { SurveySubmission } from "@/lib/types";
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  FileCheck,
  Search,
  Eye,
  Users,
  BarChart3,
  FileText,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, role, isLoading } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingSubmission, setVerifyingSubmission] = useState<SurveySubmission | null>(null);

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
              noRegistrasi: sub.noRegistrasi,
              createdAt: sub.createdAt,
              tahunSurvei: sub.tahunSurvei,
              totalIndikatorTerisi:
                sub.totalIndikatorTerisi ||
                (Array.isArray(sub.indicatorRecords) ? new Set(sub.indicatorRecords.map((r: any) => r.indicatorId)).size : 0),
              user: sub.user
                ? {
                    nama: sub.user.nama,
                    instansi: sub.user.instansi || "",
                    kabupatenKota: sub.user.kabupatenKota || "",
                  }
                : undefined,
              responden: {
                namaLengkap: sub.respondenIdentity?.namaLengkap || sub.user?.nama || "Responden",
                kabupatenKota: sub.respondenIdentity?.kabupatenKotaAsal || sub.user?.kabupatenKota || "-",
                kecamatan: sub.respondenIdentity?.kecamatan || "-",
                pekerjaan: sub.respondenIdentity?.pekerjaanJabatan || sub.user?.instansi || "Pengelola Olahraga",
                umur: sub.respondenIdentity?.umur || "-",
                jenisKelamin: sub.respondenIdentity?.jenisKelamin || "",
                nomorTelepon: sub.respondenIdentity?.nomorTelepon || "-",
              },
              answers: {},
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

  // Keyboard Navigation: Escape to close active modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (verifyingSubmission) {
          setVerifyingSubmission(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [verifyingSubmission]);

  if (isLoading || !currentUser || role !== "ADMIN") {
    return null;
  }

  const activeSubmissions = dbSubmissions;

  // Filtered submissions
  const filteredSubmissions = activeSubmissions.filter((sub) => {
    const q = searchQuery.toLowerCase();
    const nama = (sub.user?.nama || sub.responden.namaLengkap).toLowerCase();
    const instansi = (sub.user?.instansi || "").toLowerCase();
    const kab = (sub.user?.kabupatenKota || sub.responden.kabupatenKota).toLowerCase();
    const regNo = (sub.noRegistrasi || sub.id).toLowerCase();

    return (
      regNo.includes(q) ||
      nama.includes(q) ||
      instansi.includes(q) ||
      kab.includes(q)
    );
  });

  const totalSubmissions = activeSubmissions.length;

  return (
    <div className="space-y-8">
      {/* Admin Command Center Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#04331d] via-[#07482b] to-[#042917] text-white p-6 sm:p-10 shadow-elevated border border-emerald-800/40">
        {/* Decorative Shield & Audit Icon Graphic on Right Side */}
        <div className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-10 pointer-events-none hidden md:block opacity-20">
          <svg
            className="w-44 h-52 text-emerald-200"
            viewBox="0 0 160 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Shield Outline */}
            <path
              d="M80 15L25 40V95C25 135 80 175 80 175C80 175 135 135 135 95V40L80 15Z"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Checkmark inside Shield */}
            <path
              d="M55 90L72 108L108 68"
              stroke="currentColor"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-emerald-100 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>PORTAL VERIFIKATOR RESMI KEOLAHRAGAAN</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Admin Command Center &amp; Verifikasi Data
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Pantau dan audit pengajuan kuesioner keolahragaan dari seluruh responden daerah.
          </p>

          <div className="pt-2">
            <Link href="/kuesioner">
              <Button className="bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-subtle inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Isi Kuesioner Baru</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Kuesioner Terdaftar
            </span>
            <Users className="w-4 h-4 text-brand-primary" />
          </div>
          <p className="text-3xl font-extrabold text-brand-text tabular-nums">
            {totalSubmissions}
          </p>
          <span className="text-xs text-gray-400 mt-1 block">
            Submisi kuesioner tercatat di sistem database
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-card bg-emerald-50/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Tahun Survei Aktif
            </span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-900 tabular-nums">
            2024
          </p>
          <span className="text-xs text-emerald-700 mt-1 block">
            Periode pendataan survei olahraga berjalan
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
              placeholder="Cari nama responden / no registrasi / instansi..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-xs focus:border-brand-primary outline-none bg-white"
            />
          </div>
          <span className="text-xs text-gray-400 font-semibold tabular-nums shrink-0">
            {filteredSubmissions.length} Submisi Ditemukan
          </span>
        </div>

        {/* Responsive Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase font-bold tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 sm:pl-6">No. Registrasi</th>
                <th className="py-3.5 px-4">Tanggal Pengiriman</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Instansi / Pekerjaan</th>
                <th className="py-3.5 px-4">Kabupaten/Kota</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Aksi Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Tidak ada rekaman yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-brand-surface/70 transition-colors group"
                  >
                    <td className="py-4 px-4 sm:pl-6 font-mono font-bold text-brand-primary text-xs break-all">
                      {sub.noRegistrasi || sub.id}
                    </td>

                    <td className="py-4 px-4 font-semibold text-brand-text tabular-nums text-xs">
                      {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-4 px-4 font-bold text-brand-text text-xs">
                      {sub.user?.nama || sub.responden.namaLengkap}
                    </td>

                    <td className="py-4 px-4 text-brand-text text-xs">
                      {sub.user?.instansi || sub.responden.pekerjaan || "-"}
                    </td>

                    <td className="py-4 px-4 text-brand-text text-xs font-semibold">
                      {sub.user?.kabupatenKota || sub.responden.kabupatenKota}
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/validasi?submissionId=${sub.id}`)}
                        className="gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Validasi Data</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Detail Audit */}
      {verifyingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-elevated border border-gray-100">
            <div className="flex items-start justify-between p-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-100 shrink-0">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Detail Submisi Responden
                </span>
                <h3 className="text-base font-extrabold text-brand-text font-mono">
                  {verifyingSubmission.noRegistrasi || verifyingSubmission.id}
                </h3>
              </div>
              <button
                onClick={() => setVerifyingSubmission(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4 text-xs">
              <div className="bg-brand-surface rounded-2xl p-4 border border-gray-100 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 block">Nama Responden:</span>
                  <span className="font-bold text-brand-text">{verifyingSubmission.responden.namaLengkap}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Asal Wilayah:</span>
                  <span className="font-bold text-brand-text">{verifyingSubmission.responden.kabupatenKota}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Instansi:</span>
                  <span className="font-semibold text-brand-text">{verifyingSubmission.user?.instansi || "-"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Tanggal Pengiriman:</span>
                  <span className="font-semibold text-brand-text">
                    {new Date(verifyingSubmission.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-gray-100 bg-gray-50/50">
              <Button variant="outline" size="sm" onClick={() => setVerifyingSubmission(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
