"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNavbar } from "./top-navbar";
import { Mail, Phone, Clock } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-text">
      {/* Fixed Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Fixed Top Header Navbar */}
      <TopNavbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      {/* Main Content Area (padded on desktop for fixed sidebar and top navbar) */}
      <div className="flex-1 flex flex-col lg:pl-[280px] pt-16 sm:pt-20">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-100">
              {/* Brand & Security */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-extrabold text-sm text-brand-primary">
                    ARINDAMA SPORT SURVEY
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  Aplikasi evaluasi dan kuesioner resmi bidang keolahragaan untuk
                  mendukung kebijakan pembangunan olahraga daerah yang lebih terarah dan
                  berprestasi.
                </p>
              </div>

              {/* Pusat Bantuan */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">
                  Pusat Bantuan & Layanan
                </h4>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>support@arindama.id</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>0812-3456-7890</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Senin – Jumat (08.00 – 16.00 WIB)</span>
                  </li>
                </ul>
              </div>

              {/* Slogan */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 text-xs uppercase tracking-wider">
                  Komitmen Keolahragaan
                </h4>
                <p className="italic text-slate-500 leading-relaxed">
                  &ldquo;Ayo berpartisipasi! Jawaban Anda sangat berarti untuk olahraga yang
                  lebih maju dan masyarakat yang lebih sehat.&rdquo;
                </p>
                <p className="text-xs text-slate-400 mt-4">
                  © {new Date().getFullYear()} ARINDAMA. Dilindungi undang-undang.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span>Dikembangkan oleh Tim ARINDAMA</span>
              <span>Platform Evaluasi Olahraga Terpadu</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
