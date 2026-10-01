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
    if (path.startsWith("/dashboard/responden")) return "Responden";
    if (path.startsWith("/dashboard/manajemen-akun")) return "Manajemen Pengguna";
    if (path.startsWith("/dashboard/rekapitulasi-wilayah")) return "Rekapitulasi Wilayah";
    if (path.startsWith("/dashboard/bobot-dinamis")) return "Bobot Dinamis";
    if (path.startsWith("/dashboard/notifikasi")) return "Notifikasi";
    if (path.startsWith("/dashboard/log-aktivitas")) return "Log Aktivitas";
    if (path.startsWith("/kuesioner")) return "Detail Kategori";
    if (path.startsWith("/statistik")) return "Statistik";
    if (path.startsWith("/login")) return "Masuk Sistem";
    
    // Fallback title formatting
    const segment = path.split("/").filter(Boolean).pop();
    if (!segment) return "Dashboard Utama ARINDAMA";
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const breadcrumbTitle = getBreadcrumbTitle(pathname);
  const userNameDisplay = currentUser?.nama || "Drs. H. Hendra Wijaya, M.Si.";
  const userRoleDisplay =
    currentUser?.role === "ADMIN"
      ? "Admin"
      : currentUser?.role === "OPERATOR"
      ? "Operator"
      : "Admin";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[270px] z-40 h-16 sm:h-18 bg-white border-b border-slate-100/80 px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
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
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="font-bold text-slate-900 tracking-tight">ARINDAMA</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="font-bold text-slate-900 tracking-tight">{breadcrumbTitle}</span>
        </nav>
      </div>

      {/* Sisi Kanan: Notifikasi & Profil */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Lonceng Notifikasi */}
        <button
          className="relative p-2 sm:p-2.5 rounded-full bg-slate-50/80 hover:bg-slate-100 text-slate-600 border border-slate-100 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
        </button>

        {/* Profil Pengguna */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3.5 border-l border-slate-100">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 border border-slate-200 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-xs">
            <User className="w-4.5 h-4.5 text-slate-200" />
          </div>

          <div className="flex flex-col text-left">
            <span
              className="text-xs sm:text-[13px] font-bold text-slate-900 leading-tight truncate max-w-[150px] sm:max-w-[220px]"
              title={userNameDisplay}
            >
              {userNameDisplay}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 leading-tight mt-0.5">
              {userRoleDisplay}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
