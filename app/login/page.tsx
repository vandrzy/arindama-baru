"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
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

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Pengecekan autentikasi: Jika pengguna sudah login, langsung arahkan ke beranda (/) setelah rehidrasi selesai
  React.useEffect(() => {
    if (!isLoading && currentUser) {
      router.push("/");
    }
  }, [isLoading, currentUser, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Username, Email, dan Password wajib diisi.");
      return;
    }

    setLoading(true);
    
    try {
      const success = await login(username, email, password);
      setLoading(false);

      if (!success) {
        setError("Username, Email, atau Password salah. Silakan coba lagi.");
        return;
      }

      // Sesi login berhasil diupdate di context, useEffect akan otomatis melakukan redirect ke beranda (/)
    } catch (err) {
      setLoading(false);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  if (isLoading || currentUser) {
    return null;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-elevated overflow-hidden">
          {/* Green Brand Header */}
          <div className="bg-gradient-to-b from-brand-primary to-athletic-forest text-white p-8 text-center relative">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 p-2 flex items-center justify-center border border-white/30 shadow-subtle">
              <BrandLogo className="w-12 h-12" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">ARINDAMA</h1>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase block mt-0.5">
              Sport Survey
            </span>
            <p className="text-xs text-emerald-200 mt-2 font-medium">
              Kuesioner Bidang Keolahragaan
            </p>
          </div>

          {/* Login Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-brand-text">Masuk ke Akun Anda</h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Gunakan email dan password yang telah diberikan oleh administrator.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative flex items-center">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
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
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full shadow-elevated font-bold text-base mt-2"
              >
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center pt-2">
                <span className="text-xs text-brand-text-secondary">
                  Belum punya akun?{" "}
                  <Link href="/register" className="text-brand-primary font-bold hover:underline">
                    Daftar Sekarang
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
