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
  LogIn
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
    ...(isAdmin
      ? [
          {
            href: "/dashboard/manajemen-akun",
            label: "Operator",
            icon: Users,
            match: (p: string) => p.startsWith("/dashboard/manajemen-akun"),
          },
        ]
      : []),
    {
      href: "/kuesioner",
      label: "Detail Kategori",
      icon: Layers,
      match: (p: string) => p.startsWith("/kuesioner") || p.startsWith("/detail-kategori"),
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
          className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
            isActive
              ? "bg-[#0b1329] text-white shadow-md shadow-slate-950/20"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-600"}`} />
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
        {/* Branding Header with Logo */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3.5 group shrink-0"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50/70 border border-emerald-100 shadow-sm flex items-center justify-center shrink-0 p-1">
              <img
                src="/logo/logo.png"
                alt="Logo ARINDAMA"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                ARINDAMA
              </span>
              <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
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
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-2xl border border-slate-200/80 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Menu Navigasi (Tengah - Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          <div className="space-y-1.5">
            <div className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase px-3 mb-2">
              MENU UTAMA
            </div>
            {renderLinks(mainNavLinks)}
          </div>

          {configLinks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase px-3 mb-2">
                KONFIGURASI SISTEM
              </div>
              {renderLinks(configLinks)}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="px-5 pb-6 bg-white pt-3 border-t border-slate-100 space-y-3">
          {/* Dispora Kaltim Info Card */}
          <div className="bg-[#f7faf8] border border-emerald-100/60 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                Dispora Kaltim
              </span>
              <p className="text-[11px] font-medium text-slate-500 leading-snug">
                Standar 9 Kategori Kemenpora RI Tahun 2026
              </p>
            </div>
          </div>

          {/* Action Button (Keluar / Masuk) */}
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
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogIn className="w-4 h-4 text-emerald-600" />
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
