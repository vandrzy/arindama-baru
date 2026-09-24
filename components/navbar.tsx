"use client";

import React, { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = currentUser?.role === "ADMIN";

  // Close mobile menu on route change (MUST be before early return)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open (MUST be before early return)
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks: Array<{
    href: string;
    label: string;
    icon: React.ElementType;
    match: (p: string) => boolean;
  }> = [];

  // Link navigasi hanya untuk user yang sudah login
  if (currentUser) {
    navLinks.push({
      href: "/",
      label: "Beranda",
      icon: Home,
      match: (p: string) => p === "/",
    });
    navLinks.push({
      href: "/kuesioner",
      label: "Isi Kuesioner",
      icon: FileText,
      match: (p: string) => p.startsWith("/kuesioner"),
    });
    navLinks.push({
      href: "/riwayat",
      label: "Riwayat",
      icon: History,
      match: (p: string) => p.startsWith("/riwayat"),
    });
  }

  // "Portal Admin" hanya untuk ADMIN
  if (isAdmin) {
    navLinks.push({
      href: "/admin",
      label: "Portal Admin",
      icon: LayoutDashboard,
      match: (p: string) => p.startsWith("/admin"),
    });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-brand-primary text-white shadow-subtle"
                      : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Account */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-100">
            {currentUser ? (
              <>
                <div className="flex flex-col items-end mr-1">
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

          {/* Mobile: Hamburger Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-brand-text hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer - z-50 untuk tampil di atas konten */}
      {mobileOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 top-16 z-40 bg-black/40 backdrop-blur-sm"
          />
          {/* Drawer panel */}
          <div className="lg:hidden fixed top-16 left-0 right-0 z-50 bg-white shadow-elevated border-t border-gray-100 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.match(pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-brand-primary text-white shadow-subtle"
                        : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-primary-light"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="border-t border-gray-100 my-3" />

              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
                      {currentUser.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-brand-text truncate max-w-[200px]">
                        {currentUser.nama}
                      </span>
                      <span className="text-xs text-brand-text-secondary">
                        {currentUser.role === "ADMIN" ? "Administrator" : "Responden"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                      router.push("/login");
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-primary text-white border border-brand-primary hover:bg-brand-primary-hover transition-colors"
                >
                  <Users className="w-5 h-5" />
                  <span>Masuk</span>
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
