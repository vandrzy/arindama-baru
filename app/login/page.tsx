"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context/app-context";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, currentUser, isLoading } = useApp();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isLoading && currentUser) {
      router.push("/dashboard");
    }
  }, [isLoading, currentUser, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      setError("Email/NIP dan Kata Sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const success = await login(identifier, password);
      setLoading(false);

      if (!success) {
        setError("Email/NIP atau Kata Sandi salah. Silakan coba lagi.");
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-[32px] border border-slate-100/80 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* Left Column: Login Form */}
        <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          <div>
            {/* Logo & Header */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src="/logo/logo.png"
                  alt="ARINDAMA Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-[#0f172a] tracking-tight leading-none">
                    ARINDAMA
                  </span>

                </div>
                <span className="text-[11px] font-medium text-[#8898aa] block mt-0.5">
                  Dispora Pemerintah Provinsi Kalimantan Timur
                </span>
              </div>
            </div>

            {/* Greeting & Title */}
            <div className="mt-12 mb-8">
              <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
                Selamat Datang
              </h1>
              <p className="text-xs sm:text-sm text-[#718096] mt-2 leading-relaxed max-w-sm">
                Silakan masukkan detail akun Anda untuk mengakses sistem evaluasi keolahragaan.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email / NIP */}
              <div>
                <label className="block text-xs font-bold text-[#2d3748] mb-1.5">
                  Email / NIP
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="nama@dispora.kaltimprov.go.id / NIP"
                    className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#f7f9fc] border border-slate-200/80 text-sm text-[#1a202c] focus:border-[#00684a] focus:bg-white focus:ring-2 focus:ring-[#00684a]/10 outline-none transition-all placeholder:text-slate-400/80"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#2d3748]">
                    Kata Sandi
                  </label>
                  <Link
                    href="#"
                    className="text-xs font-bold text-[#00684a] hover:underline"
                  >
                    Lupa Kata Sandi?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full h-11 pl-11 pr-11 rounded-xl bg-[#f7f9fc] border border-slate-200/80 text-sm text-[#1a202c] focus:border-[#00684a] focus:bg-white focus:ring-2 focus:ring-[#00684a]/10 outline-none transition-all placeholder:text-slate-400/80"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#00684a] hover:bg-[#00543c] text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all disabled:opacity-70"
                >
                  <span>{loading ? "Memproses..." : "Masuk ke Sistem"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Left Footer */}
          <div className="pt-10 mt-6 flex items-center justify-between text-[11px] text-[#a0aec0] font-medium">
            <span>© 2026 Dispora Prov. Kaltim</span>
            <span>ARINDAMA v2.5</span>
          </div>
        </div>

        {/* Right Column: Illustration & Slogan */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8 sm:p-12 lg:p-14 border-l border-slate-100 text-center bg-white">
          <div className="w-full max-w-[360px] aspect-square relative mb-8">
            <Image
              src="/login/login.png"
              alt="Ilustrasi Olahraga ARINDAMA"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight mb-2">
            Membina Prestasi, Mengharumkan Banua
          </h2>
          <p className="text-xs text-[#718096] max-w-xs leading-relaxed">
            Sistem Evaluasi Capaian Atlet &amp; Indeks Keolahragaan Terpadu 10 Kabupaten/Kota se-Kalimantan Timur
          </p>
        </div>
      </div>
    </div>
  );
}



