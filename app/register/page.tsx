"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  User,
  Building,
  Briefcase,
  MapPin,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    nama: "",
    jabatan: "",
    kabupatenKota: "",
    instansi: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.nama.trim() ||
      !formData.jabatan.trim() ||
      !formData.kabupatenKota.trim() ||
      !formData.instansi.trim()
    ) {
      setError("Semua field (Username, Email, Password, Nama, Jabatan, Kabupaten/Kota, Instansi) wajib diisi.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          nama: formData.nama.trim(),
          jabatan: formData.jabatan.trim(),
          kabupatenKota: formData.kabupatenKota.trim(),
          instansi: formData.instansi.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal melakukan registrasi");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-elevated p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-brand-text mb-2">Registrasi Berhasil!</h2>
            <p className="text-sm text-brand-text-secondary mb-4">
              Akun Anda telah berhasil dibuat. Anda akan diarahkan ke halaman login.
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Ke Halaman Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Register Card */}
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
              Daftar Akun Baru
            </p>
          </div>

          {/* Register Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-brand-text">Buat Akun Baru</h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Isi data diri Anda untuk mendaftar sebagai responden.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email Anda"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Pelatih Atletik"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Kabupaten/Kota */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Kabupaten/Kota <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <select
                    name="kabupatenKota"
                    value={formData.kabupatenKota}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all appearance-none bg-white text-brand-text"
                  >
                    <option value="" disabled>Pilih Kabupaten/Kota</option>
                    <option value="Berau">Berau</option>
                    <option value="Kutai Barat">Kutai Barat</option>
                    <option value="Kutai Kartanegara">Kutai Kartanegara</option>
                    <option value="Kutai Timur">Kutai Timur</option>
                    <option value="Mahakam Ulu">Mahakam Ulu</option>
                    <option value="Paser">Paser</option>
                    <option value="Penajam Paser Utara">Penajam Paser Utara</option>
                    <option value="Balikpapan">Balikpapan</option>
                    <option value="Bontang">Bontang</option>
                    <option value="Samarinda">Samarinda</option>
                  </select>
                </div>
              </div>

              {/* Instansi */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Instansi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <select
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all appearance-none bg-white text-brand-text"
                  >
                    <option value="" disabled>Pilih Instansi</option>
                    <option value="DISPORA">DISPORA</option>
                    <option value="KONI">KONI</option>
                    <option value="KORMI">KORMI</option>
                    <option value="NPC Indonesia">NPC Indonesia</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-brand-text uppercase tracking-wider mb-1.5">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                <span>Daftar</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center pt-2">
                <span className="text-xs text-brand-text-secondary">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-brand-primary font-bold hover:underline">
                    Masuk di sini
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
