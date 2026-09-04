"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/app-context";
import { Users, ShieldCheck, ArrowRightLeft, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function RoleSwitcher() {
  const { role, setRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isResponden = role === "RESPONDEN";

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-elevated border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-text">
                Simulasi 2 Jenis Pengguna
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-brand-text-secondary mb-3 leading-relaxed">
            Sesuai dokumen panduan, terdapat 2 jenis pengguna dengan alur yang berbeda:
          </p>

          <div className="space-y-2">
            {/* Responden Option */}
            <button
              onClick={() => {
                setRole("RESPONDEN");
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                isResponden
                  ? "bg-brand-primary-light/60 border-brand-primary text-brand-primary"
                  : "bg-gray-50 border-gray-100 text-brand-text hover:bg-gray-100"
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>1. User / Responden</span>
                </div>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Melihat kuesioner, isi identitas, jawab 8 indikator bertahap, upload PDF sah.
                </p>
              </div>
              {isResponden && <Check className="w-4 h-4 shrink-0 text-brand-primary mt-0.5" />}
            </button>

            {/* Admin Option */}
            <button
              onClick={() => {
                setRole("ADMIN");
              }}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                !isResponden
                  ? "bg-amber-50 border-brand-accent text-brand-accent-hover"
                  : "bg-gray-50 border-gray-100 text-brand-text hover:bg-gray-100"
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>2. Admin Keolahragaan</span>
                </div>
                <p className="text-xs text-brand-text-secondary mt-1">
                  Kelola kuesioner, audit respon daerah, preview PDF langsung, ekspor laporan.
                </p>
              </div>
              {!isResponden && <Check className="w-4 h-4 shrink-0 text-brand-accent-hover mt-0.5" />}
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <Link
              href={isResponden ? "/kuesioner" : "/admin"}
              className="font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              Buka Halaman {isResponden ? "Kuesioner" : "Admin Dashboard"} →
            </Link>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-elevated transition-all border font-semibold text-xs ${
          isResponden
            ? "bg-brand-primary text-white border-emerald-700 hover:bg-brand-primary-hover"
            : "bg-brand-accent text-white border-amber-600 hover:bg-brand-accent-hover"
        }`}
      >
        <ArrowRightLeft className="w-3.5 h-3.5" />
        <span>
          Peran: <strong>{isResponden ? "Responden" : "Admin"}</strong>
        </span>
        <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse" />
      </button>
    </div>
  );
}
