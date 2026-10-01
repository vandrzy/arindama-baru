"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import { KABUPATEN_KOTA_OPTIONS, INSTANSI_OPTIONS } from "@/lib/constants/survey-data";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Building,
  MapPin,
  Phone,
  Shield,
  ArrowLeft,
  Save,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

function UserFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");
  const isEditMode = Boolean(userId);

  const { currentUser, isLoading: isAuthLoading } = useApp();

  const [formData, setFormData] = useState({
    nip: "",
    email: "",
    password: "",
    confirmPassword: "",
    nama: "",
    role: "OPERATOR" as "ADMIN" | "OPERATOR",
    jabatan: "",
    kabupatenKota: "",
    instansi: "",
    nomorTelepon: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  // Authorization check
  useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isAuthLoading, currentUser, router]);

  // Fetch user data if in edit mode
  useEffect(() => {
    if (isEditMode && userId && currentUser?.role === "ADMIN") {
      const fetchSingleUser = async () => {
        setFetchingUser(true);
        setError(null);
        try {
          const res = await fetch(`/api/users/${userId}`);
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Gagal memuat data akun.");
          }
          const u = data.user;
          setFormData({
            nip: u.nip || "",
            email: u.email || "",
            password: "",
            confirmPassword: "",
            nama: u.nama || "",
            role: u.role || "OPERATOR",
            jabatan: u.jabatan || "",
            kabupatenKota: u.kabupatenKota || "",
            instansi: u.instansi || "",
            nomorTelepon: u.nomorTelepon || "",
          });
        } catch (err: any) {
          setError(err.message || "Terjadi kesalahan saat memuat data.");
        } finally {
          setFetchingUser(false);
        }
      };
      fetchSingleUser();
    }
  }, [isEditMode, userId, currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (
      !formData.nip.trim() ||
      !formData.email.trim() ||
      !formData.nama.trim() ||
      !formData.jabatan.trim() ||
      !formData.kabupatenKota.trim() ||
      !formData.instansi.trim()
    ) {
      setError("Semua field bertanda bintang (*) wajib diisi.");
      return;
    }

    if (!isEditMode && !formData.password.trim()) {
      setError("Password wajib diisi untuk pembuatan akun baru.");
      return;
    }

    if (formData.password.trim()) {
      if (formData.password.length < 8) {
        setError("Password minimal 8 karakter.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Password dan Konfirmasi Password tidak cocok.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isEditMode ? `/api/users/${userId}` : "/api/users";
      const method = isEditMode ? "PUT" : "POST";

      const payload: any = {
        nip: formData.nip.trim(),
        email: formData.email.trim(),
        nama: formData.nama.trim(),
        role: formData.role,
        jabatan: formData.jabatan.trim(),
        kabupatenKota: formData.kabupatenKota.trim(),
        instansi: formData.instansi.trim(),
        nomorTelepon: formData.nomorTelepon.trim(),
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan data akun.");
      }

      router.push("/dashboard/manajemen-akun");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading || fetchingUser) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0B3D2E]" />
          <span className="text-sm font-medium">Memuat formulir...</span>
        </div>
      </div>
    );
  }

  if (currentUser?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header Form */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/manajemen-akun"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#0B3D2E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Data Operator</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isEditMode ? "Edit Data Operator" : "Tambah Operator Baru"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEditMode
              ? "Perbarui informasi akun operator survei keolahragaan."
              : "Isi formulir berikut untuk membuat akun operator baru dalam sistem."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Akun */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Kredensial &amp; Peran Akun
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  NIP <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="nip"
                    value={formData.nip}
                    onChange={handleChange}
                    placeholder="Masukkan 18 digit NIP"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email pengguna"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      isEditMode
                        ? "Kosongkan jika tidak ubah password"
                        : "Minimal 8 karakter"
                    }
                    className="w-full h-11 pl-10 pr-10 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Konfirmasi Password {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    className="w-full h-11 pl-10 pr-10 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profil Operator */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
              Informasi Profil &amp; Instansi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* No Telp / WA */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="nomorTelepon"
                    value={formData.nomorTelepon}
                    onChange={handleChange}
                    placeholder="Contoh: 081234567890"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Jabatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Kepala Bidang Olahraga"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Kabupaten / Kota */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Kabupaten/Kota <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <select
                    name="kabupatenKota"
                    value={formData.kabupatenKota}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all appearance-none bg-white text-slate-800"
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
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Instansi <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <select
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleChange}
                    className="w-full h-11 pl-10 pr-4 rounded-2xl border border-slate-200 text-sm focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 outline-none transition-all appearance-none bg-white text-slate-800"
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
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link href="/dashboard/manajemen-akun">
              <button
                type="button"
                className="px-5 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
            </Link>

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="bg-[#0B3D2E] hover:bg-[#07291F] text-white shadow-md rounded-2xl px-6 py-3 text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Simpan Perubahan" : "Tambah Operator"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserFormPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0B3D2E]" />
            <span className="text-sm font-medium">Memuat form...</span>
          </div>
        </div>
      }
    >
      <UserFormContent />
    </Suspense>
  );
}
