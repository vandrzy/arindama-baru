"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { TopNavbar } from "./top-navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on mobile when route changes
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-brand-text justify-between">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          {children}
        </main>
        <footer className="w-full text-center py-4 text-xs text-slate-500 bg-white border-t border-slate-100">
          Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur © 2026. Hak Cipta Dilindungi.
        </footer>
      </div>
    );
  }

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
        <footer className="w-full text-center py-4 text-xs text-slate-500 bg-white border-t border-slate-100 mt-12">
          Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur © 2026. Hak Cipta Dilindungi.
        </footer>
      </div>
    </div>
  );
}
