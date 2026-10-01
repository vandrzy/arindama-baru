"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal konfirmasi hapus
  const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Modal reset password
  const [resetPasswordUser, setResetPasswordUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Pengecekan hak akses admin
  useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isAuthLoading, currentUser, router]);

  const fetchUsers = useCallback(
    async (pageNum: number, search: string, role: string) => {
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
      fetchUsers(pagination.page, searchQuery, roleFilter);
    }
  }, [currentUser, pagination.page, searchQuery, roleFilter, fetchUsers]);

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
      fetchUsers(pagination.page, searchQuery, roleFilter);
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
      setSuccessToast(`Password untuk "${resetPasswordUser.nama}" berhasil diperbarui.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setResetPasswordError(err.message || "Terjadi kesalahan saat mereset password.");
    } finally {
      setIsResettingPassword(false);
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

        <Link href="/dashboard/manajemen-akun/form">
          <button className="bg-[#0B3D2E] hover:bg-[#082E22] active:scale-[0.98] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm flex items-center gap-2 transition-all shrink-0 self-start sm:self-center">
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
        </Link>
      </div>

      {/* Grid Card Statistik Overview (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Total Akun */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wide">Total Akun</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Admin */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wide">Admin</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.admin}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Operator Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 tracking-wide">Operator Aktif</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{stats.operator}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section Container Card Tabel */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Header Internal Card Tabel & Search/Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Akun</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan {pagination.total} akun
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, atau wilayah..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] w-full transition-all text-slate-900"
              />
            </form>

            {/* Filter Role */}
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] font-medium text-slate-700 transition-all"
            >
              <option value="">Semua Role</option>
              <option value="ADMIN">Admin</option>
              <option value="OPERATOR">Operator</option>
            </select>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabel Data Akun */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-6">PENGGUNA</th>
                <th className="py-3.5 px-6">ROLE</th>
                <th className="py-3.5 px-6">WILAYAH</th>
                <th className="py-3.5 px-6 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-36 mb-1.5" />
                      <div className="h-3 bg-slate-100 rounded w-28" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-slate-200 rounded-full w-20" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="h-8 bg-slate-200 rounded-lg w-24 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-400 text-xs sm:text-sm font-medium"
                  >
                    {searchQuery
                      ? `Tidak ditemukan akun yang cocok dengan kata kunci "${searchQuery}".`
                      : "Belum ada data akun terdaftar."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. PENGGUNA */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{user.nama}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{user.email}</div>
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
                        {/* Tombol 1: Edit Profil */}
                        <Link href={`/dashboard/manajemen-akun/form?id=${user.id}`}>
                          <button
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Profil"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </Link>

                        {/* Tombol 2: Reset Password */}
                        <button
                          onClick={() => {
                            setResetPasswordUser(user);
                            setNewPassword("");
                            setResetPasswordError(null);
                          }}
                          className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                          title="Reset Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Tombol 3: Hapus (Hanya untuk Operator) */}
                        {user.role === "OPERATOR" && (
                          <button
                            onClick={() => setDeleteModalUser(user)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
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

        {/* Pagination Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan data halaman <span className="font-bold text-slate-900">{pagination.page}</span> dari{" "}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> (Total{" "}
            <span className="font-bold text-slate-900">{pagination.total}</span> Akun)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Hapus Akun
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
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
              <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Masukkan password baru untuk akun{" "}
                <span className="font-bold text-slate-900">&quot;{resetPasswordUser.nama}&quot;</span>
              </p>
            </div>

            {resetPasswordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetPasswordError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password Baru</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetPasswordUser(null);
                  setNewPassword("");
                }}
                disabled={isResettingPassword}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isResettingPassword}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B3D2E] hover:bg-[#082E22] text-white text-xs font-bold shadow-md transition-colors"
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
