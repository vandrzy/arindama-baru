"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { Menu, ChevronRight, MapPin, Building2, User } from "lucide-react";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
}

export function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
  const pathname = usePathname();
  const { currentUser } = useApp();

  // Route title mapper for breadcrumbs
  const getBreadcrumbTitle = (path: string) => {
    if (path === "/") return "Beranda";
    if (path.startsWith("/kuesioner")) return "Kuisioner";
    if (path.startsWith("/validasi")) return "Validasi";
    if (path.startsWith("/statistik")) return "Statistik";
    if (path.startsWith("/login")) return "Masuk Sistem";
    if (path.startsWith("/register")) return "Pendaftaran Akun";
    
    // Fallback title formatting
    const segment = path.split("/").filter(Boolean)[0];
    if (!segment) return "Beranda";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbTitle = getBreadcrumbTitle(pathname);



  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[280px] z-40 h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 flex items-center justify-between transition-all duration-300">
      {/* Sisi Kiri: Mobile Hamburger + Breadcrumb Route */}
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
          <span className="font-medium text-slate-400">IPO Arindama</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 shrink-0" />
          <span className="font-bold text-slate-800">{breadcrumbTitle}</span>
        </nav>
      </div>

      {/* Sisi Kanan: Informasi Pengguna (TANPA FOTO PROFIL) */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex flex-col items-end text-right max-w-[280px] sm:max-w-[360px]">
            {/* Nama Lengkap User */}
            <span
              className="text-xs sm:text-sm font-bold text-slate-900 truncate w-full"
              title={currentUser.nama}
            >
              {currentUser.nama}
            </span>
            
            {/* Instansi dan Kabupaten/Kota (Sama seperti Navbar lama) */}
            <div className="flex items-center justify-end gap-1.5 text-[11px] sm:text-xs font-medium truncate w-full mt-0.5">
              <span className="truncate flex items-center gap-1 text-emerald-800 font-semibold" title={currentUser.kabupatenKota || "Kabupaten/Kota"}>
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                {currentUser.kabupatenKota || "Kabupaten/Kota"}
              </span>
              <span className="text-gray-300">•</span>
              <span className="truncate flex items-center gap-1 text-amber-800 font-semibold" title={currentUser.instansi || "Instansi"}>
                <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                {currentUser.instansi || "Instansi"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-end text-right">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Responden Tamu
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Masyarakat / Keolahragaan
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
