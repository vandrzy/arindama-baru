"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./brand-logo";
import { useApp } from "@/lib/context/app-context";
import {
  FileText,
  History,
  LayoutDashboard,
  Home,
  Users,
  LogOut,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useApp();

  // Hide navbar on login page
  if (pathname === "/login") return null;

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo className="w-10 h-10 sm:w-11 sm:h-11 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-primary">
                  ARINDAMA
                </span>
                <span className="text-xs sm:text-sm font-bold tracking-widest text-brand-accent uppercase">
                  Sport Survey
                </span>
              </div>
              <span className="text-xs text-brand-text-secondary font-medium hidden sm:inline">
                Kuesioner Bidang Keolahragaan Daerah
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                pathname === "/"
                  ? "bg-brand-primary-light text-brand-primary"
                  : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </Link>

            <Link
              href="/kuesioner"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                pathname.startsWith("/kuesioner")
                  ? "bg-brand-primary text-white shadow-subtle"
                  : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Isi Kuesioner</span>
            </Link>

            <Link
              href="/riwayat"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                pathname.startsWith("/riwayat")
                  ? "bg-brand-primary-light text-brand-primary"
                  : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-surface"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat</span>
            </Link>

            {isAdmin && (
              <>
                <div className="h-5 w-[1px] bg-gray-200 mx-1 sm:mx-2" />
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                    pathname.startsWith("/admin")
                      ? "bg-brand-accent text-white shadow-subtle"
                      : "bg-brand-accent-light/60 text-brand-accent-hover hover:bg-brand-accent-light"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Portal Admin</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Account */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
            {currentUser ? (
              <>
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-xs font-bold text-brand-text truncate max-w-[150px]">
                    {currentUser.nama}
                  </span>
                  <span className="text-xs text-brand-text-secondary">
                    {currentUser.role === "ADMIN" ? "Administrator" : "Responden"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border bg-gray-50 border-gray-200 text-brand-text hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border bg-brand-primary text-white border-brand-primary hover:bg-brand-primary-hover transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
