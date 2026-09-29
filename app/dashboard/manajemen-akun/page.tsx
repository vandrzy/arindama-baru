"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  Shield,
  Building,
  Briefcase,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";

interface UserItem {
  id: string;
  username: string;
  email: string;
  nama: string;
  role: "ADMIN" | "RESPONDEN";
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

export default function ManajemenAkunPage() {
  const router = useRouter();
  const { currentUser, isLoading: isAuthLoading } = useApp();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal konfirmasi hapus
  const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Pengecekan admin
  useEffect(() => {
    if (!isAuthLoading && currentUser && currentUser.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [isAuthLoading, currentUser, router]);

  const fetchUsers = useCallback(async (pageNum: number, searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/users?page=${pageNum}&limit=10&search=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil data akun");
      }
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data akun.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === "ADMIN") {
      fetchUsers(pagination.page, search);
    }
  }, [currentUser, pagination.page, search, fetchUsers]);

  // Debounce search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

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
      fetchUsers(pagination.page, search);
    } catch (err: any) {
      setDeleteError(err.message || "Terjadi kesalahan saat menghapus akun.");
    } finally {
      setIsDeleting(false);
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
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

      {/* Header Halaman */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B3D2E]/10 flex items-center justify-center text-[#0B3D2E]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Manajemen Akun
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Kelola daftar pengguna, peran (role), dan data responden survei.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Link href="/dashboard/manajemen-akun/form">
            <Button
              variant="primary"
              className="bg-[#0B3D2E] hover:bg-[#07291F] text-white shadow-md rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, email, username, instansi..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0B3D2E] text-white text-xs font-semibold rounded-xl hover:bg-[#07291F] transition-colors"
          >
            Cari
          </button>
        </form>

        <div className="text-xs text-slate-500 font-medium">
          Total Data: <span className="font-bold text-slate-900">{pagination.total}</span> Akun
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabel Data Akun */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-4 px-6">Pengguna</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Jabatan &amp; Instansi</th>
                <th className="py-4 px-4">Wilayah</th>
                <th className="py-4 px-4">No. Telp / WA</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-slate-200 rounded-full w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-28 mb-1" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-8 bg-slate-200 rounded-xl w-16 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                    {search
                      ? `Tidak ditemukan akun yang cocok dengan kata kunci "${search}".`
                      : "Belum ada data akun terdaftar."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0B3D2E] text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {user.nama ? user.nama.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.nama}</div>
                          <div className="text-slate-500 text-xs flex items-center gap-2 mt-0.5">
                            <span>@{user.username}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Shield className="w-3 h-3 text-amber-600" />
                          ADMIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          RESPONDEN
                        </span>
                      )}
                    </td>

                    {/* Jabatan & Instansi */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.jabatan || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{user.instansi || "-"}</span>
                      </div>
                    </td>

                    {/* Wilayah */}
                    <td className="py-4 px-4 text-xs font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.kabupatenKota || "-"}</span>
                      </div>
                    </td>

                    {/* No. Telp / WA */}
                    <td className="py-4 px-4 text-xs">
                      {user.nomorTelepon ? (
                        <a
                          href={`https://wa.me/${user.nomorTelepon.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{user.nomorTelepon}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">-</span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/dashboard/manajemen-akun/form?id=${user.id}`}>
                          <button
                            className="p-2 rounded-xl text-slate-600 hover:text-[#0B3D2E] hover:bg-slate-100 transition-colors"
                            title="Edit Akun"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>

                        <button
                          onClick={() => setDeleteModalUser(user)}
                          className="p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Akun"
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Halaman <span className="font-bold text-slate-800">{pagination.page}</span> dari{" "}
              <span className="font-bold text-slate-800">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Akun</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus akun{" "}
                <span className="font-bold text-slate-900">&quot;{deleteModalUser.nama}&quot;</span> (@
                {deleteModalUser.username})? Tindakan ini tidak dapat dibatalkan.
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
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <Button
                variant="primary"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Hapus Akun
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
