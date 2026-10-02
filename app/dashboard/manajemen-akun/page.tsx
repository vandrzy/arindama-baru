"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import { INSTANSI_OPTIONS } from "@/lib/constants/survey-data";
import {
  Users,
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  Pencil,
  KeyRound,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

interface UserItem {
  id: string;
  nip: string;
  email: string;
  nama: string;
  role: "ADMIN" | "OPERATOR";
  jabatan: string;
  kabupatenKota: string;
  instansi: string;
  nomorTelepon: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserStats {
  total: number;
  admin: number;
  operator: number;
}

export default function ManajemenAkunPage() {
  const router = useRouter();
  const { currentUser, isLoading: isAuthLoading } = useApp();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admin: 0,
    operator: 0,
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [kabupatenKotaFilter, setKabupatenKotaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal konfirmasi hapus
  const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Modal reset / ganti password
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  // Modal Form Tambah / Edit Pengguna
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [userFormMode, setUserFormMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
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
  const [isSubmittingUserForm, setIsSubmittingUserForm] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Pengecekan hak akses admin
  useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isAuthLoading, currentUser, router]);

  const fetchUsers = useCallback(
    async (pageNum: number, search: string, role: string, kabupatenKota: string) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: pageNum.toString(),
          limit: "10",
          search: search,
        });
        if (role) {
          queryParams.append("role", role);
        }
        if (kabupatenKota) {
          queryParams.append("kabupatenKota", kabupatenKota);
        }

        const res = await fetch(`/api/users?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal mengambil data akun");
        }

        setUsers(data.users || []);
        setPagination(
          data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 }
        );
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat data akun.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (currentUser && currentUser.role === "ADMIN") {
      fetchUsers(pagination.page, searchQuery, roleFilter, kabupatenKotaFilter);
    }
  }, [currentUser, pagination.page, searchQuery, roleFilter, kabupatenKotaFilter, fetchUsers]);

  // Handle live search / submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKabupatenKotaFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKabupatenKotaFilter(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Hapus akun handler
  const handleDeleteConfirm = async () => {
    if (!deleteModalUser) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/users/${deleteModalUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus akun");
      }

      setDeleteModalUser(null);
      setSuccessToast(`Akun "${deleteModalUser.nama}" berhasil dihapus.`);
      setTimeout(() => setSuccessToast(null), 4000);
      fetchUsers(pagination.page, searchQuery, roleFilter, kabupatenKotaFilter);
    } catch (err: any) {
      setDeleteError(err.message || "Terjadi kesalahan saat menghapus akun.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset password handler
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser) return;

    if (newPassword.trim().length < 8) {
      setResetPasswordError("Password minimal 8 karakter.");
      return;
    }

    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setResetPasswordError("Password Baru dan Konfirmasi Password tidak cocok.");
      return;
    }

    setIsResettingPassword(true);
    setResetPasswordError(null);

    try {
      const res = await fetch(`/api/users/${resetPasswordUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mereset password");
      }

      setResetPasswordUser(null);
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccessToast(`Password untuk "${resetPasswordUser.nama}" berhasil diperbarui.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setResetPasswordError(err.message || "Terjadi kesalahan saat mereset password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Submit User Form (Tambah & Edit Modal)
  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    if (
      !userFormData.nip.trim() ||
      !userFormData.email.trim() ||
      !userFormData.nama.trim() ||
      !userFormData.jabatan.trim() ||
      !userFormData.kabupatenKota.trim() ||
      !userFormData.instansi.trim()
    ) {
      setUserFormError("Semua field bertanda bintang (*) wajib diisi.");
      return;
    }

    if (userFormData.nip.trim().length !== 18) {
      setUserFormError("NIP harus terdiri dari 18 digit angka.");
      return;
    }

    if (userFormMode === "ADD") {
      if (!userFormData.password.trim()) {
        setUserFormError("Password wajib diisi untuk pembuatan akun baru.");
        return;
      }
      if (userFormData.password.length < 8) {
        setUserFormError("Password minimal 8 karakter.");
        return;
      }
      if (userFormData.password !== userFormData.confirmPassword) {
        setUserFormError("Password dan Konfirmasi Password tidak cocok.");
        return;
      }
    }

    setIsSubmittingUserForm(true);

    try {
      const endpoint = userFormMode === "ADD" ? "/api/users" : `/api/users/${editingUserId}`;
      const method = userFormMode === "ADD" ? "POST" : "PUT";

      const payload: any = {
        nip: userFormData.nip.trim(),
        email: userFormData.email.trim(),
        nama: userFormData.nama.trim(),
        role: userFormData.role,
        jabatan: userFormData.jabatan.trim(),
        kabupatenKota: userFormData.kabupatenKota.trim(),
        instansi: userFormData.instansi.trim(),
        nomorTelepon: userFormData.nomorTelepon.trim(),
      };

      if (userFormMode === "ADD" && userFormData.password.trim()) {
        payload.password = userFormData.password.trim();
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data akun.");
      }

      setIsUserFormModalOpen(false);
      setSuccessToast(
        userFormMode === "ADD"
          ? `Akun ${userFormData.role === "ADMIN" ? "Admin" : "Operator"} "${userFormData.nama}" berhasil dibuat.`
          : `Profil akun "${userFormData.nama}" berhasil diperbarui.`
      );
      setTimeout(() => setSuccessToast(null), 4000);
      fetchUsers(pagination.page, searchQuery, roleFilter, kabupatenKotaFilter);
    } catch (err: any) {
      setUserFormError(err.message || "Terjadi kesalahan saat menyimpan akun.");
    } finally {
      setIsSubmittingUserForm(false);
    }
  };

  if (isAuthLoading || !currentUser) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-[#0B3D2E]" />
          <span className="text-sm font-medium">Memverifikasi hak akses...</span>
        </div>
      </div>
    );
  }

  if (currentUser.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Success */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Halaman Utama */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola akun Admin &amp; Operator (1 operator aktif per Kota/Kabupaten) — Khusus Admin
          </p>
        </div>

        <button
          onClick={() => {
            setUserFormMode("ADD");
            setEditingUserId(null);
            setUserFormData({
              nip: "",
              email: "",
              password: "",
              confirmPassword: "",
              nama: "",
              role: "OPERATOR",
              jabatan: "",
              kabupatenKota: "",
              instansi: "",
              nomorTelepon: "",
            });
            setUserFormError(null);
            setShowPassword(false);
            setShowConfirmPassword(false);
            setIsUserFormModalOpen(true);
          }}
          className="bg-[#0B3D2E] hover:bg-[#082E22] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm flex items-center gap-2 transition-all shrink-0 self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Grid Card Statistik Overview (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Total Akun */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Akun Terdaftar</span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.total}</div>
            <span className="text-[11px] text-slate-400">Seluruh akun terdaftar</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Admin */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Administrator</span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.admin}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Akses penuh sistem</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Operator Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Operator Wilayah</span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.operator}</div>
            <span className="text-[11px] text-blue-600 font-medium">Operator Kota/Kabupaten</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section Pencarian & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Form Search Teks */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, email, NIP, atau wilayah..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all bg-slate-50/50"
          />
        </form>

        {/* Filter Dropdown Role & Wilayah */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 shrink-0">Filter Role:</label>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all w-full sm:w-auto"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operator</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 shrink-0">Filter Wilayah:</label>
            <select
              value={kabupatenKotaFilter}
              onChange={handleKabupatenKotaFilterChange}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all w-full sm:w-auto"
            >
              <option value="">Semua Wilayah</option>
              <option value="Provinsi Kalimantan Timur">Provinsi Kalimantan Timur</option>
              <option value="Kota Balikpapan">Kota Balikpapan</option>
              <option value="Kota Bontang">Kota Bontang</option>
              <option value="Kota Samarinda">Kota Samarinda</option>
              <option value="Kabupaten Berau">Kabupaten Berau</option>
              <option value="Kabupaten Kutai Barat">Kabupaten Kutai Barat</option>
              <option value="Kabupaten Kutai Kartanegara">Kabupaten Kutai Kartanegara</option>
              <option value="Kabupaten Kutai Timur">Kabupaten Kutai Timur</option>
              <option value="Kabupaten Mahakam Ulu">Kabupaten Mahakam Ulu</option>
              <option value="Kabupaten Paser">Kabupaten Paser</option>
              <option value="Kabupaten Penajam Paser Utara">Kabupaten Penajam Paser Utara</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card Tabel "Daftar Akun" */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Header Tabel */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Akun Pengguna</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {users.length} dari {pagination.total} akun terdaftar
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0B3D2E]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memuat...</span>
            </div>
          )}
        </div>

        {error && (
          <div className="m-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6">Pengguna</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Wilayah / Instansi</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B3D2E]" />
                    <span className="text-xs font-medium">Memuat data pengguna...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold text-slate-600">Tidak ada data pengguna ditemukan.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci pencarian atau filter role.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. PENGGUNA */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[#0B3D2E] text-sm shrink-0">
                          {user.nama ? user.nama.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm leading-tight">{user.nama}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">NIP: {user.nip || "—"}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* 2. ROLE */}
                    <td className="py-4 px-6">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-700 border border-emerald-200/60">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-700 border border-blue-200/60">
                          Operator
                        </span>
                      )}
                    </td>

                    {/* 3. WILAYAH */}
                    <td className="py-4 px-6 text-slate-700 font-medium text-xs sm:text-sm">
                      {user.kabupatenKota ? (
                        <div>
                          <div>{user.kabupatenKota}</div>
                          {user.instansi && (
                            <div className="text-xs text-slate-400 font-normal">{user.instansi}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* 4. AKSI */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Tombol 1: Edit Profil (Modal) */}
                        <button
                          onClick={() => {
                            setUserFormMode("EDIT");
                            setEditingUserId(user.id);
                            setUserFormData({
                              nip: user.nip || "",
                              email: user.email || "",
                              password: "",
                              confirmPassword: "",
                              nama: user.nama || "",
                              role: user.role || "OPERATOR",
                              jabatan: user.jabatan || "",
                              kabupatenKota: user.kabupatenKota || "",
                              instansi: user.instansi || "",
                              nomorTelepon: user.nomorTelepon || "",
                            });
                            setUserFormError(null);
                            setShowPassword(false);
                            setShowConfirmPassword(false);
                            setIsUserFormModalOpen(true);
                          }}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Profil"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Tombol 2: Reset Password */}
                        <button
                          onClick={() => {
                            setResetPasswordUser(user);
                            setNewPassword("");
                            setConfirmNewPassword("");
                            setShowResetPassword(false);
                            setShowResetConfirmPassword(false);
                            setResetPasswordError(null);
                          }}
                          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Tombol 3: Hapus (Hanya untuk Operator) */}
                        {user.role === "OPERATOR" && (
                          <button
                            onClick={() => setDeleteModalUser(user)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Operator"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-bold text-slate-900">{pagination.page}</span> dari{" "}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> ({pagination.total} total akun)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
              )
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && (
                      <span className="px-2 text-slate-400 text-xs font-bold">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        p === pagination.page
                          ? "bg-[#0B3D2E] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah / Edit Pengguna */}
      {isUserFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full my-8 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Fixed at top) */}
            <div className="p-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0B3D2E] flex items-center justify-center border border-emerald-100 shrink-0">
                  {userFormMode === "ADD" ? <Plus className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {userFormMode === "ADD" ? "Tambah Pengguna Baru" : "Edit Profil Pengguna"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {userFormMode === "ADD"
                      ? "Isi formulir berikut untuk membuat akun Admin atau Operator"
                      : "Perbarui data profil pengguna."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUserFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUserFormSubmit} className="flex-1 flex flex-col overflow-hidden">
              {/* Modal Scrollable Body (Confined within border-radius) */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-5">
                {userFormError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span className="font-semibold">{userFormError}</span>
                  </div>
                )}

                {/* Role Select Dropdown - HANYA PADA MODE TAMBAH AKUN */}
                {userFormMode === "ADD" && (
                  <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#0B3D2E]" />
                      <span>Peran / Hak Akses System *</span>
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) =>
                        setUserFormData((prev) => ({
                          ...prev,
                          role: e.target.value as "ADMIN" | "OPERATOR",
                          kabupatenKota: e.target.value === "ADMIN" ? "Provinsi Kalimantan Timur" : prev.kabupatenKota,
                        }))
                      }
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all bg-white font-semibold text-slate-900"
                    >
                      <option value="OPERATOR">Operator Dispora (Kota/Kabupaten)</option>
                      <option value="ADMIN">Administrator Dispora (Provinsi Kaltim)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {userFormData.role === "ADMIN"
                        ? "Hak akses Administrator: Memiliki wewenang penuh mengelola akun, rekapitulasi, dan matriks bobot."
                        : "Hak akses Operator: Memiliki wewenang menginput dan melengkapi data responden pada wilayah/instansi."}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* NIP */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">NIP / NIPPPK (18 Digit) *</label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      placeholder="198503242010011002"
                      value={userFormData.nip}
                      onChange={(e) => setUserFormData((prev) => ({ ...prev, nip: e.target.value.replace(/\D/g, "") }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Akun *</label>
                    <input
                      type="email"
                      required
                      placeholder="contoh@kaltimprov.go.id"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Drs. H. Hendra Wijaya, M.Si."
                    value={userFormData.nama}
                    onChange={(e) => setUserFormData((prev) => ({ ...prev, nama: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Jabatan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Jabatan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kepala Bidang Keolahragaan"
                      value={userFormData.jabatan}
                      onChange={(e) => setUserFormData((prev) => ({ ...prev, jabatan: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium"
                    />
                  </div>

                  {/* Instansi */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Instansi / Lembaga *</label>
                    <select
                      required
                      value={userFormData.instansi}
                      onChange={(e) => setUserFormData((prev) => ({ ...prev, instansi: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all bg-white text-slate-900 font-medium"
                    >
                      <option value="">-- Pilih Instansi --</option>
                      {INSTANSI_OPTIONS.map((ins) => (
                        <option key={ins} value={ins}>
                          {ins}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kabupaten / Kota */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kabupaten / Kota *</label>
                    <select
                      required
                      value={userFormData.kabupatenKota}
                      onChange={(e) => setUserFormData((prev) => ({ ...prev, kabupatenKota: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all bg-white text-slate-900 font-medium"
                    >
                      <option value="">-- Pilih Wilayah --</option>
                      {userFormData.role === "ADMIN" && (
                        <option value="Provinsi Kalimantan Timur">Provinsi Kalimantan Timur</option>
                      )}
                      <option value="Kota Balikpapan">Kota Balikpapan</option>
                      <option value="Kota Bontang">Kota Bontang</option>
                      <option value="Kota Samarinda">Kota Samarinda</option>
                      <option value="Kabupaten Berau">Kabupaten Berau</option>
                      <option value="Kabupaten Kutai Barat">Kabupaten Kutai Barat</option>
                      <option value="Kabupaten Kutai Kartanegara">Kabupaten Kutai Kartanegara</option>
                      <option value="Kabupaten Kutai Timur">Kabupaten Kutai Timur</option>
                      <option value="Kabupaten Mahakam Ulu">Kabupaten Mahakam Ulu</option>
                      <option value="Kabupaten Paser">Kabupaten Paser</option>
                      <option value="Kabupaten Penajam Paser Utara">Kabupaten Penajam Paser Utara</option>
                    </select>
                  </div>

                  {/* Nomor Telepon */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Contoh: 081234567890"
                      value={userFormData.nomorTelepon}
                      onChange={(e) => setUserFormData((prev) => ({ ...prev, nomorTelepon: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password (HANYA PADA MODE TAMBAH AKUN) */}
                {userFormMode === "ADD" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder="Minimal 8 karakter"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Konfirmasi Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          placeholder="Ulangi password"
                          value={userFormData.confirmPassword}
                          onChange={(e) => setUserFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions Footer (Fixed at bottom) */}
              <div className="p-4 sm:px-8 border-t border-slate-100 bg-slate-50/50 shrink-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUserFormModalOpen(false)}
                  disabled={isSubmittingUserForm}
                  className="py-2.5 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmittingUserForm}
                  className="py-2.5 px-6 rounded-xl bg-[#0B3D2E] hover:bg-[#082E22] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  {userFormMode === "ADD" ? "Buat Akun Pengguna" : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <UserMinus className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Akun</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun operator{" "}
                <span className="font-bold text-slate-900">&quot;{deleteModalUser.nama}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Hapus Akun
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset / Ganti Password */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleResetPasswordSubmit}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Ganti / Reset Password</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Masukkan password baru untuk akun{" "}
                <span className="font-bold text-slate-900">&quot;{resetPasswordUser.nama}&quot;</span>
              </p>
            </div>

            {resetPasswordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="font-semibold">{resetPasswordError}</span>
              </div>
            )}

            {/* Password Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Password Baru *</label>
              <div className="relative">
                <input
                  type={showResetPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Konfirmasi Password Baru *</label>
              <div className="relative">
                <input
                  type={showResetConfirmPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Ulangi password baru"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900 font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetPasswordUser(null);
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
                disabled={isResettingPassword}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isResettingPassword}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B3D2E] hover:bg-[#082E22] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                Simpan Password
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
