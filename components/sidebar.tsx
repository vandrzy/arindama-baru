"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import {
  Home,
  FileText,
  FileCheck,
  BarChart3,
  Search,
  LogOut,
  Users,
  X,
  UserPlus,
  SlidersHorizontal,
  Map,
  Activity,
  ShieldCheck,
  LayoutGrid,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
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
    ...(isAdmin
      ? [
          {
            href: "/dashboard/manajemen-akun",
            label: "Data Responden",
            icon: UserPlus,
            match: (p: string) => p.startsWith("/dashboard/manajemen-akun"),
          },
        ]
      : []),
    {
      href: "/kuesioner",
      label: "Berkas & Bukti Sah",
      icon: FileCheck,
      match: (p: string) => p.startsWith("/kuesioner"),
    },
    {
      href: "/statistik",
      label: "Statistik",
      icon: FileText,
      match: (p: string) => p.startsWith("/statistik"),
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
  ];

  const configLinks = isAdmin
    ? [
        {
          href: "/dashboard/bobot-dinamis",
          label: "Bobot Dinamis",
          icon: SlidersHorizontal,
          match: (p: string) => p.startsWith("/dashboard/bobot-dinamis"),
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
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-150 ${
            isActive
              ? "bg-[#0f172a] text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-500"}`} />
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
        className={`fixed inset-y-0 left-0 z-50 w-[280px] h-screen bg-white border-r border-slate-100 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Branding Header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 bg-[#0e1726] rounded-xl flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                ARINDAMA
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
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
        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari data, menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-medium rounded-full border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Hak Akses Card */}
        <div className="px-5 pb-2">
          <div className="border border-slate-100 rounded-2xl p-3 flex items-center justify-between shadow-sm bg-white">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">
                Hak Akses Menu
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {isAdmin ? "Admin Provinsi" : "Responden"}
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>

        {/* Menu Navigasi (Tengah - Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 mt-2 pb-4 space-y-6">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-3 mb-1">
              MENU UTAMA
            </div>
            {renderLinks(mainNavLinks)}
          </div>

          {configLinks.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-3 mb-1">
                KONFIGURASI SISTEM
              </div>
              {renderLinks(configLinks)}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="px-5 pb-6 bg-white pt-2 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-extrabold text-slate-900">Dispora Kaltim v2.4</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 leading-snug">
              Standar 9 Kategori Kemenpora RI Tahun 2026
            </p>
          </div>

          {currentUser ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                <span>Keluar Sistem</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Masuk Sistem</span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
