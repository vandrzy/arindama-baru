"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import { KABUPATEN_KOTA_OPTIONS, INSTANSI_OPTIONS } from "@/lib/constants/survey-data";
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
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { currentUser, isLoading } = useApp();

  // Pengecekan autentikasi: Jika pengguna sudah login, langsung arahkan ke dasbor (/dashboard) setelah rehidrasi selesai
  React.useEffect(() => {
    if (!isLoading && currentUser) {
      router.push("/dashboard");
    }
  }, [isLoading, currentUser, router]);

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

  if (currentUser) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Registrasi Berhasil!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Akun Anda telah berhasil dibuat. Anda akan diarahkan ke halaman login.
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full bg-[#0B3D2E] hover:bg-[#082e22]">
                Ke Halaman Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 sm:py-10 px-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Panel - Branding & Info */}
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

            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-emerald-100 backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Portal Resmi Registrasi Responden
              </span>
            </div>

            {/* Headline & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Survei Kebugaran &amp; Pembinaan Olahraga Kalimantan Timur
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-3 leading-relaxed">
                Platform registrasi resmi untuk pendataan berkala performa, fasilitas, dan pembinaan insan olahraga di 10 Kabupaten/Kota di wilayah Provinsi Kalimantan Timur.
              </p>
            </div>

            {/* Registered Category Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3 text-xs text-emerald-50">
              <div className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                Kategori Responden Terdaftar
              </div>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pelatih Atletik &amp; Tenaga Keolahragaan Bersertifikat</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pengurus Cabang Olahraga (Pengcab / Pengprov)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Aparatur Dispora Provinsi &amp; Dispora Kab/Kota se-Kaltim</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Left Footer - Security Info */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-white">Standar Enkripsi &amp; Audit BSSN Terverifikasi</p>
              <p className="text-[11px] text-emerald-200/70 mt-0.5">
                Data registrasi dijamin kerahasiaannya sesuai regulasi UU PDP No. 27 Tahun 2022.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Header Form */}
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h2>
              <p className="text-xs text-gray-500 mt-1">
                Isi data diri Anda untuk mendaftar sebagai responden.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    USERNAME <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Masukkan username"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    EMAIL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Masukkan email Anda"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    NAMA LENGKAP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Jabatan */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    JABATAN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      placeholder="Contoh: Pelatih Atletik"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Kabupaten/Kota */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    KABUPATEN/KOTA <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <select
                      name="kabupatenKota"
                      value={formData.kabupatenKota}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all appearance-none bg-white text-gray-800"
                    >
                      <option value="" disabled>Pilih Kabupaten/Kota</option>
                      {KABUPATEN_KOTA_OPTIONS.map((kota) => (
                        <option key={kota} value={kota}>
                          {kota}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Instansi */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    INSTANSI <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <select
                      name="instansi"
                      value={formData.instansi}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all appearance-none bg-white text-gray-800"
                    >
                      <option value="" disabled>Pilih Instansi</option>
                      {INSTANSI_OPTIONS.map((inst) => (
                        <option key={inst} value={inst}>
                          {inst}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    PASSWORD <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 8 karakter"
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

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    KONFIRMASI PASSWORD <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ulangi password"
                      className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 text-sm focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E] outline-none transition-all"
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
                  <span>Daftar</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-500">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-[#0B3D2E] font-bold hover:underline">
                    Masuk di sini
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

