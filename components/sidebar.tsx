"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./brand-logo";
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
  UserPlus
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

  const navLinks = [
    {
      href: "/",
      label: "Beranda",
      icon: Home,
      match: (p: string) => p === "/",
    },
    {
      href: "/kuesioner",
      label: "Kuisioner",
      icon: FileText,
      match: (p: string) => p.startsWith("/kuesioner"),
    },
    {
      href: "/validasi",
      label: "Validasi",
      icon: FileCheck,
      match: (p: string) => p.startsWith("/validasi"),
    },
    {
      href: "/statistik",
      label: "Statistik",
      icon: BarChart3,
      match: (p: string) => p.startsWith("/statistik"),
    },
  ];

  // Filter links by search query
  const filteredLinks = navLinks.filter((link) =>
    link.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
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
        {/* Branding Header (Paling Atas) */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 group shrink-0"
          >
            <BrandLogo className="w-10 h-10 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-brand-primary">
                  ARINDAMA
                </span>
                <span className="text-[11px] font-bold tracking-widest text-brand-accent uppercase">
                  Sport Survey
                </span>
              </div>
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

        {/* Search Bar (Bilah Pencarian Fitur) */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari fitur menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* Menu Navigasi (Tengah - Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-3 uppercase px-2">
            MENU UTAMA
          </div>

          {filteredLinks.length > 0 ? (
            filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-[1rem] text-sm font-semibold transition-all duration-150 group ${
                    isActive
                      ? "bg-brand-primary text-white shadow-subtle"
                      : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light"
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-brand-primary"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })
          ) : (
            <div className="px-3 py-4 text-center text-xs text-slate-400">
              Tidak ada fitur menu yang cocok dengan &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Bottom Section (Keluar / Masuk Sistem) */}
        <div className="mt-auto border-t border-slate-100 p-4 bg-white">
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                <span>Keluar Sistem</span>
              </div>
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-sm"
              >
                <Users className="w-4 h-4" />
                <span>Masuk Sistem</span>
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-brand-primary hover:bg-slate-50 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun Baru</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
