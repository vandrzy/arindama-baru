"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import {
  LayoutGrid,
  Users,
  Layers,
  BarChart3,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  LogOut,
  Search,
  X,
  ChevronRight,
  UserCheck,
  LogIn,
  FileText,
  Award,
  CalendarClock
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  const mainNavLinks = [
    {
      href: "/dashboard",
      label: "Dashboard Utama",
      icon: LayoutGrid,
      match: (p: string) => p === "/dashboard" || p === "/",
    },
    {
      href: "/dashboard/responden",
      label: "Responden",
      icon: UserCheck,
      match: (p: string) => p.startsWith("/dashboard/responden"),
    },
    {
      href: "/kuesioner",
      label: "Detail Kategori",
      icon: Layers,
      match: (p: string) => p.startsWith("/kuesioner") || p.startsWith("/detail-kategori"),
    },
    {
      href: "/dashboard/peraihan-medali",
      label: "Peraihan Medali",
      icon: Award,
      match: (p: string) => p.startsWith("/dashboard/peraihan-medali"),
    },
    ...(isAdmin
      ? [
          {
            href: "/dashboard/rekapitulasi-wilayah",
            label: "Rekapitulasi Wilayah",
            icon: BarChart3,
            match: (p: string) => p.startsWith("/dashboard/rekapitulasi-wilayah"),
          },
        ]
      : []),
    {
      href: "/dashboard/notifikasi",
      label: "Notifikasi",
      icon: Bell,
      match: (p: string) => p.startsWith("/dashboard/notifikasi") || p.startsWith("/notifikasi"),
    },
  ];

  const configLinks = isAdmin
    ? [
        {
          href: "/dashboard/batas-waktu",
          label: "Batas Waktu (Cut-Off)",
          icon: CalendarClock,
          match: (p: string) => p.startsWith("/dashboard/batas-waktu"),
        },
        {
          href: "/dashboard/bobot-dinamis",
          label: "Bobot Dinamis",
          icon: SlidersHorizontal,
          match: (p: string) => p.startsWith("/dashboard/bobot-dinamis"),
        },
        {
          href: "/dashboard/manajemen-akun",
          label: "Manajemen Pengguna",
          icon: Users,
          match: (p: string) => p.startsWith("/dashboard/manajemen-akun"),
        },
        {
          href: "/dashboard/log-aktivitas",
          label: "Log Aktivitas",
          icon: FileText,
          match: (p: string) => p.startsWith("/dashboard/log-aktivitas"),
        },
      ]
    : [];

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
  };

  const renderLinks = (links: any[]) => {
    const filtered = links.filter((link) =>
      link.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    return filtered.map((link) => {
      const Icon = link.icon;
      const isActive = link.match(pathname);
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
            isActive
              ? "bg-[#0b1329] text-white font-semibold shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 font-medium"
          }`}
        >
          <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-500"}`} />
          <span>{link.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[270px] h-screen bg-white border-r border-slate-100 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Branding Header with Logo */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50/80 border border-emerald-100 shadow-xs flex items-center justify-center shrink-0 p-1">
              <img
                src="/logo/logo.png"
                alt="Logo ARINDAMA"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-black tracking-tight text-slate-900 leading-tight">
                ARINDAMA
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                Pemerintah Provinsi Kaltim
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Tutup Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-5 pb-3.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari data, menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-[12px] font-normal rounded-full border border-slate-200/70 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
            />
          </div>
        </div>

        {/* Menu Navigasi (Tengah - Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3.5 space-y-5">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-1.5">
              MENU UTAMA
            </div>
            {renderLinks(mainNavLinks)}
          </div>

          {configLinks.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-1.5">
                KONFIGURASI SISTEM
              </div>
              {renderLinks(configLinks)}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="px-4 pb-5 bg-white pt-3 border-t border-slate-100 space-y-2.5">
          {/* Dispora Kaltim Info Card */}
          <div className="bg-[#f2f9f5] border border-emerald-100/70 rounded-xl p-3 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                Dispora Kaltim
              </span>
              <p className="text-[10px] font-medium text-slate-500 leading-snug">
                Standar 9 Kategori Kemenpora RI Tahun 2026
              </p>
            </div>
          </div>

          {/* Action Button (Keluar / Masuk) */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                <span>Keluar Sistem</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>Masuk Sistem</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
