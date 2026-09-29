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
  Filter,
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

  // Handle Search Submit
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

      {/* Header Halaman Utama (Di Luar & Di Atas Card Tabel) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Basis Data Responden Kalimantan Timur
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit kepatuhan kuota responden dari 105 Kecamatan se-Kalimantan Timur (Standar Kemenpora RI)
          </p>
        </div>

        <Link href="/dashboard/manajemen-akun/form">
          <Button
            variant="primary"
            size="md"
            className="bg-slate-950 hover:bg-slate-800 text-white shadow-sm rounded-2xl px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 shrink-0 self-start sm:self-center h-auto"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Tambah Responden</span>
          </Button>
        </Link>
      </div>

      {/* Main Container Card Tabel Data */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Header Internal Card Tabel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Daftar Responden Se-Kalimantan Timur
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh data sampel individu keolahragaan dari 10 Kabupaten/Kota se-Kaltim
            </p>
          </div>

          {/* Filter Search */}
          <form onSubmit={handleSearchSubmit} className="relative shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter responden..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] w-48 sm:w-60 transition-all"
            />
          </form>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabel Data Responden */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                <th className="py-4 px-6">NAMA RESPONDEN</th>
                <th className="py-4 px-4">JABATAN</th>
                <th className="py-4 px-4">INSTANSI</th>
                <th className="py-4 px-4">KECAMATAN / KELURAHAN (WILAYAH)</th>
                <th className="py-4 px-4">KONTAK</th>
                <th className="py-4 px-6 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-36 mb-1.5" />
                      <div className="h-3 bg-slate-100 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-28" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded w-28" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="h-8 bg-slate-200 rounded-xl w-16 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs sm:text-sm font-medium">
                    {search
                      ? `Tidak ditemukan responden yang cocok dengan kata kunci "${search}".`
                      : "Belum ada data responden terdaftar."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. NAMA RESPONDEN (Foto Profil Dihapus) */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{user.nama}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-2 mt-0.5">
                          <span>@{user.username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. JABATAN */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.jabatan || "-"}</span>
                      </div>
                    </td>

                    {/* 3. INSTANSI */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{user.instansi || "-"}</span>
                      </div>
                    </td>

                    {/* 4. KECAMATAN / KELURAHAN (WILAYAH) */}
                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{user.kabupatenKota || "-"}</span>
                      </div>
                    </td>

                    {/* 5. KONTAK */}
                    <td className="py-4 px-4 text-xs">
                      {user.nomorTelepon ? (
                        <a
                          href={`https://wa.me/${user.nomorTelepon.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/70"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{user.nomorTelepon}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">-</span>
                      )}
                    </td>

                    {/* 6. AKSI */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/dashboard/manajemen-akun/form?id=${user.id}`}>
                          <button
                            className="p-2 rounded-xl text-slate-500 hover:text-[#0B3D2E] hover:bg-slate-100 transition-colors"
                            title="Edit Responden"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>

                        <button
                          onClick={() => setDeleteModalUser(user)}
                          className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Hapus Responden"
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

        {/* Pagination Controls (Pengaturan Halaman Tetap Digunakan) */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan data halaman <span className="font-bold text-slate-900">{pagination.page}</span> dari{" "}
            <span className="font-bold text-slate-900">{pagination.totalPages}</span> (Total{" "}
            <span className="font-bold text-slate-900">{pagination.total}</span> Responden)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
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

