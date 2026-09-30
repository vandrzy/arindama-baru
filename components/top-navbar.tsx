"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { Menu, ChevronRight, Bell, User } from "lucide-react";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
}

export function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
  const pathname = usePathname();
  const { currentUser } = useApp();

  // Route title mapper for breadcrumbs
  const getBreadcrumbTitle = (path: string) => {
    if (path === "/" || path === "/dashboard") return "Dashboard Utama ARINDAMA";
    if (path.startsWith("/dashboard/manajemen-akun")) return "Data Operator";
    if (path.startsWith("/dashboard/rekapitulasi-wilayah")) return "Rekapitulasi Wilayah";
    if (path.startsWith("/dashboard/bobot-dinamis")) return "Bobot Dinamis";
    if (path.startsWith("/kuesioner")) return "Berkas & Bukti Sah";
    if (path.startsWith("/statistik")) return "Statistik";
    if (path.startsWith("/login")) return "Masuk Sistem";
    
    // Fallback title formatting
    const segment = path.split("/").filter(Boolean).pop();
    if (!segment) return "Dashboard Utama ARINDAMA";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbTitle = getBreadcrumbTitle(pathname);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] z-40 h-16 sm:h-20 bg-white border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
      {/* Sisi Kiri: Mobile Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          aria-label="Buka Menu Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <span className="font-medium text-slate-400">ARINDAMA</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 shrink-0" />
          <span className="font-extrabold text-slate-900">{breadcrumbTitle}</span>
        </nav>
      </div>

      {/* Sisi Kanan: Notifikasi & Profil Default */}
      <div className="flex items-center gap-4">
        {/* Lonceng Notifikasi */}
        <button
          className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        </button>

        {/* Profil Pengguna dengan Avatar Default */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <User className="w-5 h-5" />
          </div>

          <div className="flex flex-col text-left">
            <span
              className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[220px]"
              title={currentUser?.nama || "Drs. H. Hendra Wijaya, M.Si."}
            >
              {currentUser?.nama || "Drs. H. Hendra Wijaya, M.Si."}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 leading-tight">
              {currentUser?.role === "ADMIN" ? "Admin" : currentUser?.role || "Admin"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
