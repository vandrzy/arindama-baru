"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Check, Clock, FileText, Users, Shield, ArrowRight } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "Validasi Berkas",
    iconType: "document",
    title: "Pengesahan Berkas Sertifikat Berhasil",
    badgeLabel: "Terverifikasi Sah",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description: "Dokumen bukti fisik kejuaraan nasional ACT-SMD-001 atas nama Dimas Arya Nugraha telah diverifikasi sah oleh Tim Verifikator Dispora Kaltim. Poin indeks komposit +60 telah ditambahkan ke rekapitulasi wilayah.",
    time: "10 menit yang lalu",
    isRead: false,
  },
  {
    id: 2,
    type: "Kuota Responden",
    iconType: "users",
    title: "Peringatan Kuota Responden: Kota Samarinda",
    badgeLabel: "Target 93%",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "Kecamatan Samarinda Kota telah mencatatkan 28 dari 30 kuota responden wajib KAT-01. Tambahkan 2 responden lagi untuk menyelesaikan target pemenuhan kuota wilayah.",
    time: "1 jam yang lalu",
    isRead: false,
  },
  {
    id: 3,
    type: "Pengumuman",
    iconType: "shield",
    title: "Matriks Bobot 3 Kelompok Olahraga Diperbarui",
    badgeLabel: "Regulasi Baru",
    badgeColor: "bg-purple-100 text-purple-700",
    description: "Dinas Pemuda dan Olahraga Provinsi Kaltim telah memisahkan matriks pembobotan menjadi 3 pilar: Olahraga Prestasi, Olahraga Disabilitas, dan Olahraga Rekreasi. Harap pedomani standar terbaru.",
    time: "1 hari yang lalu",
    isRead: false,
  },
];

export default function NotifikasiPage() {
  const [activeTab, setActiveTab] = useState("Semua Notifikasi");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const TABS = [
    "Semua Notifikasi",
    `Belum Dibaca (${notifications.filter((n) => !n.isRead).length})`,
    "Validasi Berkas",
    "Kuota Responden",
    "Pengumuman",
  ];

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getFilteredNotifications = () => {
    if (activeTab === "Semua Notifikasi") return notifications;
    if (activeTab.startsWith("Belum Dibaca"))
      return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => n.type === activeTab);
  };

  const filteredNotifs = getFilteredNotifications();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER BREADCRUMB (Opsional, jika belum ada di layout global) */}
      <div className="text-sm font-bold text-slate-500 mb-2">
        ARINDAMA <span className="text-slate-300 mx-1">›</span>{" "}
        <span className="text-slate-900">Pusat Notifikasi & Agenda</span>
      </div>

      {/* HERO SECTION */}
      <Card className="bg-[#0f1f1a] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border-0 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-4 z-10 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Bell className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              Pusat Notifikasi & Agenda Kaltim
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pemberitahuan Sistem & Validasi Berkas
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Pantau status verifikasi sertifikat, pembaruan kuota responden kecamatan,
            serta pengumuman resmi Dispora Kaltim.
          </p>
        </div>
        <div className="z-10 shrink-0">
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-xl px-5 h-12 shadow-sm transition-all"
          >
            <Check className="w-4 h-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
        </div>
        {/* Dekorasi Background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <Bell className="w-96 h-96" />
        </div>
      </Card>

      {/* FILTER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
        <div className="text-xs font-medium text-slate-400 shrink-0">
          Menampilkan {filteredNotifs.length} pemberitahuan
        </div>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="space-y-4">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => (
            <Card
              key={notif.id}
              className={`p-6 rounded-2xl flex flex-col sm:flex-row gap-5 transition-all shadow-sm ${
                !notif.isRead
                  ? "bg-emerald-50/20 border-emerald-200/60"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* Ikon */}
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  {notif.iconType === "document" && <FileText className="w-6 h-6" />}
                  {notif.iconType === "users" && <Users className="w-6 h-6" />}
                  {notif.iconType === "shield" && <Shield className="w-6 h-6" />}
                </div>
              </div>

              {/* Konten Utama */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {notif.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${notif.badgeColor}`}
                  >
                    {notif.badgeLabel}
                  </span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {notif.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  {notif.time}
                </div>
              </div>

              {/* Aksi Sisi Kanan */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-4 sm:pt-0 sm:pl-4 sm:border-l sm:border-slate-100">
                <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-9 px-5 shadow-sm text-xs">
                  Buka <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
                {!notif.isRead ? (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Tandai Dibaca
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-slate-300">
                    Sudah Dibaca
                  </span>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="p-12 text-center text-slate-500 border border-dashed border-slate-200 rounded-2xl">
            Tidak ada notifikasi dalam kategori ini.
          </div>
        )}
      </div>
    </div>
  );
}
