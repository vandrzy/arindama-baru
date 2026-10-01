"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bell,
  Users,
  FileClock,
  ArrowRight,
  Loader2,
  Clock,
  ShieldAlert,
  FileCheck
} from "lucide-react";
import { useApp } from "@/lib/context/app-context";

export default function NotifikasiPage() {
  const { currentUser, isLoading } = useApp();
  const [loading, setLoading] = useState(true);

  // Admin stats
  const [adminStats, setAdminStats] = useState({
    perluDiverifikasi: 0,
    totalResponden: 0,
    belumLengkap: 0,
  });

  // Operator stats
  const [operatorStats, setOperatorStats] = useState({
    perluDilengkapi: 0,
    sudahDiverifikasi: 0,
    totalRespondenOperator: 0,
  });

  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (isAdmin) {
          // Fetch Admin stats
          const [dashRes, respRes] = await Promise.all([
            fetch("/api/admin/dashboard").then((r) => (r.ok ? r.json() : null)),
            fetch("/api/responden").then((r) => (r.ok ? r.json() : null)),
          ]);

          const perluDiverifikasi = dashRes?.antreanValidasi ?? 0;
          const totalResponden = Array.isArray(respRes)
            ? respRes.length
            : respRes?.data?.length ?? 0;

          // Berkas belum lengkap (revisi / pending)
          const belumLengkap =
            dashRes?.recentSubmissions?.filter(
              (s: any) => s.status === "Revisi" || s.status === "Menunggu Review"
            ).length ?? 0;

          setAdminStats({
            perluDiverifikasi,
            totalResponden,
            belumLengkap,
          });
        } else {
          // Fetch Operator stats
          const opRes = await fetch("/api/dashboard/operator").then((r) =>
            r.ok ? r.json() : null
          );

          if (opRes) {
            setOperatorStats({
              perluDilengkapi: opRes.menungguReview ?? 0,
              sudahDiverifikasi: opRes.totalDisetujui ?? 0,
              totalRespondenOperator: opRes.totalResponden ?? 0,
            });
          }
        }
      } catch (err) {
        console.error("Gagal memuat data notifikasi:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!isLoading && currentUser) {
      loadData();
    }
  }, [isAdmin, currentUser, isLoading]);

  // Data ringkasan sesuai role
  const notifications = isAdmin
    ? [
        {
          id: "admin-1",
          type: "Validasi Berkas",
          icon: FileClock,
          iconBg: "bg-amber-50 text-amber-600 border-amber-100",
          badgeColor: "bg-amber-100 text-amber-800",
          badgeLabel: "Perlu Verifikasi",
          title: "Total Berkas Perlu Diverifikasi",
          count: adminStats.perluDiverifikasi,
          unit: "Berkas",
          description:
            "Terdapat berkas pengajuan indikator dari operator daerah yang membutuhkan verifikasi dan pengesahan oleh Tim Verifikator Dispora.",
          actionText: "Verifikasi Berkas",
          actionUrl: "/kuesioner",
          time: "Pembaruan Real-time",
        },
        {
          id: "admin-2",
          type: "Data Responden",
          icon: Users,
          iconBg: "bg-blue-50 text-blue-600 border-blue-100",
          badgeColor: "bg-blue-100 text-blue-800",
          badgeLabel: "Database Terdaftar",
          title: "Total Responden Saat Ini",
          count: adminStats.totalResponden,
          unit: "Orang",
          description:
            "Akumulasi seluruh data responden atlet, pelatih, wasit, dan tenaga keolahragaan yang telah terdaftar di sistem ARINDAMA.",
          actionText: "Kelola Responden",
          actionUrl: "/dashboard/responden",
          time: "Terdaftar Keseluruhan",
        },
        {
          id: "admin-3",
          type: "Kelengkapan Berkas",
          icon: ShieldAlert,
          iconBg: "bg-rose-50 text-rose-600 border-rose-100",
          badgeColor: "bg-rose-100 text-rose-800",
          badgeLabel: "Belum Lengkap",
          title: "Total Berkas Belum Lengkap",
          count: adminStats.belumLengkap,
          unit: "Berkas",
          description:
            "Berkas atau entri data yang masih membutuhkan perbaikan, kelengkapan dokumen pendukung, atau revisi dari operator.",
          actionText: "Lihat Rekapitulasi",
          actionUrl: "/dashboard/rekapitulasi-wilayah",
          time: "Perlu Tindak Lanjut",
        },
      ]
    : [
        {
          id: "op-1",
          type: "Pekerjaan Operator",
          icon: FileClock,
          iconBg: "bg-amber-50 text-amber-600 border-amber-100",
          badgeColor: "bg-amber-100 text-amber-800",
          badgeLabel: "Perlu Dilengkapi",
          title: "Total Berkas Perlu Dilengkapi",
          count: operatorStats.perluDilengkapi,
          unit: "Berkas",
          description:
            "Jumlah entri kuesioner atau bukti fisik pendukung yang masih belum lengkap atau memerlukan unggahan dokumen.",
          actionText: "Lengkapi Kuesioner",
          actionUrl: "/kuesioner",
          time: "Tugas Aktif",
        },
        {
          id: "op-2",
          type: "Status Verifikasi",
          icon: FileCheck,
          iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
          badgeColor: "bg-emerald-100 text-emerald-800",
          badgeLabel: "Terverifikasi Sah",
          title: "Total Berkas Sudah Diverifikasi",
          count: operatorStats.sudahDiverifikasi,
          unit: "Berkas",
          description:
            "Berkas capaian indikator yang telah ditinjau dan dinyatakan Sah & Terverifikasi oleh tim verifikator Dispora.",
          actionText: "Lihat Status",
          actionUrl: "/kuesioner",
          time: "Status Disetujui",
        },
        {
          id: "op-3",
          type: "Responden Saya",
          icon: Users,
          iconBg: "bg-blue-50 text-blue-600 border-blue-100",
          badgeColor: "bg-blue-100 text-blue-800",
          badgeLabel: "Input Operator",
          title: "Total Responden Diinput",
          count: operatorStats.totalRespondenOperator,
          unit: "Orang",
          description:
            "Jumlah data responden atlet, pelatih, dan tenaga olahraga yang telah Anda daftarkan atas nama wilayah/instansi Anda.",
          actionText: "Daftar Responden",
          actionUrl: "/dashboard/responden",
          time: "Input Mandiri",
        },
      ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* HERO SECTION */}
      <Card className="bg-[#0f1f1a] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border-0 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 z-10 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              Pusat Notifikasi & Informasi Penting • Mode {isAdmin ? "Admin" : "Operator"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Informasi Ringkasan & Agenda Kerja
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Pantau status indikator utama, verifikasi berkas survei, serta pencapaian target responden secara terpusat.
          </p>
        </div>

        {/* Dekorasi Background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Bell className="w-96 h-96" />
        </div>
      </Card>

      {/* LIST KARTU INFORMASI PENTING */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500">Memuat informasi penting...</p>
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {notifications.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={item.id}
                className="p-6 rounded-2xl flex flex-col sm:flex-row gap-5 transition-all shadow-sm hover:shadow-md bg-white border-slate-200"
              >
                {/* Ikon */}
                <div className="shrink-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.iconBg}`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>

                {/* Konten Utama */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {item.title}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${item.badgeColor}`}
                    >
                      {item.badgeLabel}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 py-1">
                    <span className="text-2xl font-black text-slate-900">
                      {item.count}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      {item.unit}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 pt-1">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                  </div>
                </div>

                {/* Aksi Sisi Kanan */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-4 sm:pt-0 sm:pl-4 sm:border-l sm:border-slate-100">
                  <Link href={item.actionUrl}>
                    <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-5 shadow-sm text-xs">
                      {item.actionText} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

