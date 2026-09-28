"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser, isLoading } = useApp();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pengecekan autentikasi: Jika pengguna sudah login, langsung arahkan ke dasbor (/dashboard) setelah rehidrasi selesai
  React.useEffect(() => {
    if (!isLoading && currentUser) {
      router.push("/dashboard");
    }
  }, [isLoading, currentUser, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError("Email/Username dan Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const success = await login(identifier, password);
      setLoading(false);

      if (!success) {
        setError("Email/Username atau Password salah. Silakan coba lagi.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  if (currentUser) {
    return null;
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 sm:py-10 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Panel - Branding & Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B3D2E] via-[#0D4837] to-[#125440] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Light Effects */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Section */}
          <div className="relative z-10 space-y-6">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border border-white/20">
                <BrandLogo className="w-7 h-7" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wider block leading-none">ARINDAMA</span>
                <span className="text-[10px] font-bold text-emerald-300 tracking-widest uppercase">Sport Survey</span>
              </div>
            </div>

            {/* Pill Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-emerald-100 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Portal Resmi Layanan Survei
              </span>
            </div>

            {/* Headline & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Survei Kebugaran &amp; Pembinaan Olahraga Kalimantan Timur
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-3 leading-relaxed">
                Platform terpadu Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur dalam mengumpulkan, memverifikasi, dan menganalisis indikator keolahragaan daerah guna perumusan kebijakan pembangunan olahraga Kalimantan Timur yang presisi dan transparan.
              </p>
            </div>

            {/* Assessment Feature Points */}
            <div className="space-y-3.5 text-xs text-emerald-50 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Akses Data &amp; Evaluasi Terpusat</p>
                  <p className="text-[11px] text-emerald-100/70 mt-0.5">
                    Instrumen asesmen terstandardisasi bagi 10 Kabupaten/Kota se-Kalimantan Timur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Terhubung ke Satu Data Kalimantan Timur &amp; Satu Data Indonesia</p>
                  <p className="text-[11px] text-emerald-100/70 mt-0.5">
                    Interoperabilitas data statistik sektoral nasional secara otomatis dan tervalidasi.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Standar Keamanan Enkripsi BSSN</p>
                  <p className="text-[11px] text-emerald-100/70 mt-0.5">
                    Audit integritas data berbasis kriptografi dan perlindungan kerahasiaan identitas responden.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">
                Standar Enkripsi &amp; Audit BSSN Terverifikasi
              </p>
              <p className="text-[11px] text-emerald-200/70 mt-0.5">
                Data dilindungi sesuai regulasi UU PDP No. 27 Tahun 2022
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Top Security Badge */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-2">
              <Lock className="w-4 h-4 text-[#0B3D2E]" />
              <span>Autentikasi Aman</span>
            </div>

            {/* Header Form */}
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-bold text-gray-900">Masuk ke Akun Anda</h2>
              <p className="text-xs text-gray-500 mt-1">
                Masukkan identitas akun untuk mengakses instrumen survei.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email / Username */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  USERNAME ATAU EMAIL <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan username atau email Anda"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    PASSWORD <span className="text-red-500">*</span>
                  </label>
                  <Link href="#" className="text-xs font-semibold text-[#0B3D2E] hover:underline">
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full bg-[#0B3D2E] hover:bg-[#07291F] text-white shadow-md font-bold text-base h-12 flex items-center justify-center gap-2 rounded-xl transition-all"
                >
                  <span>Masuk ke Portal Survei</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  Belum punya akun?{" "}
                  <Link href="/register" className="text-[#0B3D2E] font-bold hover:underline">
                    Daftar sekarang
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Right Footer */}
          <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Building className="w-4 h-4 text-gray-400 shrink-0" />
            <span>Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur</span>
          </div>
        </div>
      </div>
    </div>
  );
}

