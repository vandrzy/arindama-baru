"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/lib/context/app-context";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { 
  BarChart3, 
  FileCheck, 
  Users, 
  Medal, 
  Trophy, 
  Loader2, 
  Printer,
  Activity,
  X,
  Building2,
  FileText,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Globe
} from "lucide-react";
import { useRouter } from "next/navigation";

function getKategoriFromSkor(skor: number) {
  if (skor > 600) return { label: "Tinggi", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
  if (skor > 400) return { label: "Menengah", color: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
  return { label: "Rendah", color: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" };
}

export default function RekapitulasiWilayahPage() {
  const { currentUser, isLoading: isSessionLoading } = useApp();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Filters
  const [selectedPilar, setSelectedPilar] = useState("Semua");

  const pilarOptions = ["Semua", "Prestasi (KONI)", "Disabilitas (NPC)", "Masyarakat (KORMI)", "Dispora"];

  useEffect(() => {
    if (!isSessionLoading && currentUser?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [currentUser, isSessionLoading, router]);

  useEffect(() => {
    if (currentUser?.role === "ADMIN") {
      fetchData();
    }
  }, [selectedPilar, currentUser]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/rekapitulasi-wilayah?tingkat=Tingkat 2&pilar=${selectedPilar}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        console.error("Gagal mengambil data rekapitulasi:", json.error);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (isSessionLoading || !currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  const pemimpin = data?.peringkatWilayah?.[0];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
      {/* 1. HEADER HALAMAN & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PROVINSI KALIMANTAN TIMUR
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Rekapitulasi Wilayah &amp; Indeks IPO
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Pemantauan berjenjang peringkat Kabupaten/Kota se-Kalimantan Timur bersumber langsung dari Database
          </p>
        </div>

        {/* Tombol Cetak Berita Acara (Membuka Modal PDF) */}
        <button
          onClick={() => setIsPdfModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#0e1726] hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm hover:shadow self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Cetak Berita Acara</span>
        </button>
      </div>

      {/* 2. CARDS RINGKASAN REKAPITULASI (4 CARDS MATCHING DESIGN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: STATUS VALIDASI BERKAS */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400">
              STATUS VALIDASI BERKAS
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isLoading ? "-" : `${(data?.totalDataTerverifikasi || 0).toLocaleString("id-ID")} Dokumen`}
            </div>
            <div className="text-xs font-bold text-emerald-600">
              {data?.persentaseTerverifikasi || "0.0"}% Terverifikasi Sah
            </div>
          </div>
        </div>

        {/* Card 2: TOTAL MEDALI SAH */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400">
              TOTAL MEDALI SAH
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isLoading ? "-" : `${(data?.medaliSah?.total || 0).toLocaleString("id-ID")} Medali`}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/80">
                🥇 {data?.medaliSah?.emas || 0} Emas
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200/80">
                🥈 {data?.medaliSah?.perak || 0} Perak
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-orange-50 text-orange-800 border border-orange-200/80">
                🥉 {data?.medaliSah?.perunggu || 0} Perunggu
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: KEPATUHAN KUOTA OPERATOR */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400">
              KEPATUHAN KUOTA OPERATOR
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isLoading ? "-" : (data?.totalOperator || 0).toLocaleString("id-ID")}
            </div>
            <div className="text-xs font-bold text-blue-600">
              Cakupan 105 Kecamatan se-Kaltim
            </div>
          </div>
        </div>

        {/* Card 4: PEMIMPIN PERINGKAT */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all space-y-3">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400">
              PEMIMPIN PERINGKAT
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate" title={pemimpin?.namaWilayah || "-"}>
              {pemimpin ? pemimpin.namaWilayah : "-"}
            </div>
            <div className="text-xs font-bold text-emerald-600">
              Skor Capaian: {pemimpin ? Math.round(pemimpin.skor) : 0} ({getKategoriFromSkor(pemimpin?.skor || 0).label})
            </div>
          </div>
        </div>
      </div>

      {/* 3. TERGABUNG: FILTER BERJENJANG & TABEL PERINGKAT INDEKS IPO */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        {/* Unified Card Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
              FILTER BERJENJANG
            </h3>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Pilih Skala Wilayah &amp; Kategori Olahraga
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Pilar Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-50/80 p-1 rounded-full border border-slate-100">
              {pilarOptions.map(opt => {
                const isSelected = selectedPilar === opt;
                let icon = null;
                if (opt === "Prestasi (KONI)") icon = <Trophy className="w-3.5 h-3.5" />;
                else if (opt === "Disabilitas (NPC)") icon = <Activity className="w-3.5 h-3.5" />;
                else if (opt === "Masyarakat (KORMI)") icon = <Users className="w-3.5 h-3.5" />;
                else if (opt === "Dispora") icon = <Globe className="w-3.5 h-3.5" />;

                const displayLabel = opt === "Semua" ? "Semua Pilar" : opt;

                return (
                  <button
                    key={opt}
                    onClick={() => setSelectedPilar(opt)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-[#0e1726] text-white shadow-sm"
                        : "bg-transparent text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                    }`}
                  >
                    {icon}
                    <span>{displayLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Unified Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
              <p className="text-xs font-bold text-slate-500">Memuat data peringkat wilayah dari database...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="py-3.5 px-6 pl-8 w-24">PERINGKAT</th>
                  <th className="py-3.5 px-6">KABUPATEN / KOTA</th>
                  <th className="py-3.5 px-6 text-center">SKOR INDEKS CAPAIAN</th>
                  <th className="py-3.5 px-6 text-center">RESPONDEN TERISI</th>
                  <th className="py-3.5 px-6 text-center">MEDALI SAH</th>
                  <th className="py-3.5 px-6 text-center pr-8">KLASIFIKASI KINERJA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {data?.peringkatWilayah?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                      Tidak ada data peringkat wilayah untuk filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  data?.peringkatWilayah?.map((wilayah: any, index: number) => {
                    const statusKategori = getKategoriFromSkor(wilayah.skor);
                    const rankNum = index + 1;
                    let rankBadge = (
                      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                        #{rankNum}
                      </span>
                    );
                    if (rankNum === 1) {
                      rankBadge = (
                        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-200">
                          🥇
                        </span>
                      );
                    } else if (rankNum === 2) {
                      rankBadge = (
                        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-300">
                          🥈
                        </span>
                      );
                    } else if (rankNum === 3) {
                      rankBadge = (
                        <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center border border-orange-200">
                          🥉
                        </span>
                      );
                    }

                    return (
                      <tr key={wilayah.namaWilayah || index} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 pl-8">
                          {rankBadge}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900">{wilayah.namaWilayah}</div>
                          <div className="text-[11px] font-semibold text-slate-400">Kalimantan Timur</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-base font-black text-slate-900">
                            {Math.round(wilayah.skor)} Poin
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-700">
                          {wilayah.jumlahResponden ?? wilayah.jumlahOperator} Responden
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Medal className="w-3.5 h-3.5 text-amber-600" />
                            {wilayah.jumlahMedaliSah} Medali
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center pr-8">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusKategori.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusKategori.dot}`}></span>
                            {statusKategori.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* 5. MODAL DIALOG PREVIEW PDF BERITA ACARA */}
      <Modal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)}>
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Pratinjau Dokumen Berita Acara</h3>
                  <p className="text-xs text-slate-500 font-medium">Laporan Resmi Peringkat Kabupaten/Kota &amp; Skor Indeks Status</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Print PDF</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Content Preview PDF (Printable Container) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-100/60 print:bg-white print:p-0 print:overflow-visible">
              <div id="printable-pdf-document" className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 text-slate-800">
                {/* Kop Berita Acara */}
                <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                  <h4 className="text-xs font-bold tracking-widest text-slate-500 uppercase">PEMERINTAH PROVINSI KALIMANTAN TIMUR</h4>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">BERITA ACARA REKAPITULASI INDEKS IPO</h2>
                  <p className="text-xs text-slate-600 font-semibold">
                    Hasil Evaluasi Indeks Capaian Pembangunan Olahraga Daerah Tingkat Kabupaten/Kota
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1 font-medium">
                    Tanggal Dicetak: {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Filter Meta Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Skala Wilayah:</span>
                    <span className="font-extrabold text-slate-800">Kabupaten / Kota</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Pilar Keolahragaan:</span>
                    <span className="font-extrabold text-slate-800">{selectedPilar}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Total Operator DB:</span>
                    <span className="font-extrabold text-slate-800">{data?.totalOperator || 0} Orang</span>
                  </div>
                </div>

                {/* Tabel Peringkat PDF */}
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    I. DAFTAR PERINGKAT KABUPATEN / KOTA &amp; SKOR INDEKS
                  </h5>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-700">
                          <th className="py-2.5 px-4 text-center w-14">PERINGKAT</th>
                          <th className="py-2.5 px-4">KABUPATEN / KOTA</th>
                          <th className="py-2.5 px-4 text-center">TOTAL RESPONDEN</th>
                          <th className="py-2.5 px-4 text-center">MEDALI SAH</th>
                          <th className="py-2.5 px-4 text-center">SKOR INDEKS</th>
                          <th className="py-2.5 px-4 text-center">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {data?.peringkatWilayah?.map((wilayah: any, idx: number) => {
                          const status = getKategoriFromSkor(wilayah.skor);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-4 text-center font-extrabold text-slate-900">#{idx + 1}</td>
                              <td className="py-2.5 px-4 font-bold text-slate-900">{wilayah.namaWilayah}</td>
                              <td className="py-2.5 px-4 text-center text-slate-700">{wilayah.jumlahResponden ?? wilayah.jumlahOperator}</td>
                              <td className="py-2.5 px-4 text-center text-slate-700">{wilayah.jumlahMedaliSah}</td>
                              <td className="py-2.5 px-4 text-center font-extrabold text-slate-900">{Math.round(wilayah.skor)}</td>
                              <td className="py-2.5 px-4 text-center font-bold">{status.label}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Catatan Keabsahan */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
                  <div className="space-y-1 text-slate-500 text-[11px]">
                    <p className="font-semibold text-slate-700">Dokumen ini secara resmi dihasilkan oleh Sistem ARINDAMA.</p>
                    <p>Seluruh skor indeks dihitung berdasarkan akumulasi indikator sah di Database.</p>
                  </div>

                  <div className="text-center space-y-12 pr-4">
                    <p className="font-bold text-slate-800">Tim Evaluator IPO Kaltim</p>
                    <div className="border-b border-slate-400 w-36 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="px-5 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-1.5 bg-[#0e1726] hover:bg-slate-800 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Cetak Berita Acara</span>
              </button>
            </div>
          </div>
      </Modal>
    </div>
  );
}
