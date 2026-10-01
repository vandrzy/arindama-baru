"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context/app-context";
import { UserCheck, Calendar, ChevronDown, Save, Search, CheckCircle2 } from "lucide-react";

// Mock Data Kaltim
const KALTIM_DATA = {
  "Kota Balikpapan": ["Balikpapan Barat", "Balikpapan Kota", "Balikpapan Selatan", "Balikpapan Tengah", "Balikpapan Timur", "Balikpapan Utara"],
  "Kota Bontang": ["Bontang Barat", "Bontang Selatan", "Bontang Utara"],
  "Kota Samarinda": ["Loa Janan Ilir", "Palaran", "Samarinda Ilir", "Samarinda Kota", "Samarinda Seberang", "Samarinda Ulu", "Samarinda Utara", "Sambutan", "Sungai Kunjang", "Sungai Pinang"],
  "Kabupaten Berau": ["Batu Putih", "Biatan", "Biduk-Biduk", "Gunung Tabur", "Kelay", "Maratua", "Pulau Derawan", "Sambaliung", "Segah", "Tabalar", "Talisayan", "Tanjung Redeb", "Teluk Bayur"],
  "Kabupaten Kutai Barat": ["Barong Tongkok", "Benangaq", "Bentiang Besar", "Damai", "Jempang", "Linggang Bigung", "Long Iram", "Melak", "Mook Manaar Bulatn", "Muara Lawa", "Muara Pahu", "Nyuatan", "Penyinggahan", "Sekolaq Darat", "Siluq Ngurai", "Tering"],
  "Kabupaten Kutai Kartanegara": ["Anggana", "Kembang Janggut", "Kenohan", "Kota Bangun", "Kota Bangun Darat", "Loa Janan", "Loa Kulu", "Marang Kayu", "Muara Badak", "Muara Jawa", "Muara Kaman", "Muara Muntai", "Muara Wis", "Samboja", "Samboja Barat", "Sanga-Sanga", "Sebulu", "Tabang", "Tenggarong", "Tenggarong Seberang"],
  "Kabupaten Kutai Timur": ["Batu Ampar", "Bengalon", "Busang", "Kaliorang", "Karangan", "Kaubun", "Kongbeng", "Long Mesangat", "Muara Ancalong", "Muara Bengkal", "Muara Wahau", "Rantau Pulung", "Sandaran", "Sangatta Selatan", "Sangatta Utara", "Sangkulirang", "Telen", "Teluk Pandan"],
  "Kabupaten Mahakam Ulu": ["Laham", "Long Apari", "Long Bagun", "Long Hubung", "Long Pahangai"],
  "Kabupaten Paser": ["Batu Engau", "Batu Sopang", "Kuaro", "Long Ikis", "Long Kali", "Muara Komam", "Muara Samu", "Paser Belengkong", "Tanah Grogot", "Tanjung Harapan"],
  "Kabupaten Penajam Paser Utara": ["Babulu", "Penajam", "Sepaku", "Waru"]
};

interface Responden {
  nik: string;
  nama: string;
  jenisKelamin: string;
  tanggalLahir: string;
  kabupatenKota: string;
  kecamatan: string;
  cabangOlahraga: string;
  nomorTelepon: string;
}

export default function RespondenPage() {
  const { currentUser } = useApp();
  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    jenisKelamin: "Laki-laki",
    tanggalLahir: "",
    kabupatenKota: "",
    kecamatan: "",
    cabangOlahraga: "",
    nomorTelepon: "",
  });
  const [usia, setUsia] = useState<string>("Pilih tanggal lahir...");

  const [respondens, setRespondens] = useState<Responden[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Kalkulasi Usia
  useEffect(() => {
    if (formData.tanggalLahir) {
      const birthDate = new Date(formData.tanggalLahir);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setUsia(`${age} Tahun`);
    } else {
      setUsia("Pilih tanggal lahir...");
    }
  }, [formData.tanggalLahir]);

  // Fetch Data
  const fetchRespondens = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/responden?page=${page}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setRespondens(data.responden);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Gagal memuat data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRespondens();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/responden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccessPopup(true);
        setFormData({ ...formData, nik: "", nama: "", jenisKelamin: "Laki-laki", tanggalLahir: "", cabangOlahraga: "", nomorTelepon: "" });
        fetchRespondens();
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        setErrorMessage(data.error || "Gagal menyimpan data. Periksa kembali form Anda.");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const kecamatanList = formData.kabupatenKota ? (KALTIM_DATA[formData.kabupatenKota as keyof typeof KALTIM_DATA] || []) : [];

  return (
    <>
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-xl border border-emerald-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Berhasil!</h3>
            <p className="text-slate-500 text-sm mb-6">Data responden berhasil disimpan ke dalam sistem.</p>
            <button 
              onClick={() => setShowSuccessPopup(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      <div className="space-y-6 pb-8">

      {/* Header Info */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                Aktif
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Basisdata Responden {currentUser?.kabupatenKota || "Kalimantan Timur"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sesuai standar operasional Kemenpora RI, pastikan data responden valid dan aktual.
            </p>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <div className="text-2xl font-black text-slate-900">{respondens.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terdata</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {currentUser?.role !== "ADMIN" && (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Formulir Pendaftaran Responden Baru</h3>
            <p className="text-xs text-slate-500 mt-1">Kalkulasi usia otomatis berdasarkan tanggal lahir responden</p>
          </div>
          <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">Wajib Data Sah</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Muhammad Ilham, S.Pd."
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">NIK *</label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="16 Digit NIK"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Jenis Kelamin *</label>
              <div className="flex items-center gap-3">
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-bold ${formData.jenisKelamin === 'Laki-laki' ? 'bg-emerald-50/50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="Laki-laki"
                    checked={formData.jenisKelamin === 'Laki-laki'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    className="hidden"
                  />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${formData.jenisKelamin === 'Laki-laki' ? 'border-emerald-500' : 'border-slate-300'}`}>
                    {formData.jenisKelamin === 'Laki-laki' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                  </div>
                  Laki-laki
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-bold ${formData.jenisKelamin === 'Perempuan' ? 'bg-emerald-50/50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  <input
                    type="radio"
                    name="jenisKelamin"
                    value="Perempuan"
                    checked={formData.jenisKelamin === 'Perempuan'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    className="hidden"
                  />
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${formData.jenisKelamin === 'Perempuan' ? 'border-emerald-500' : 'border-slate-300'}`}>
                    {formData.jenisKelamin === 'Perempuan' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                  </div>
                  Perempuan
                </label>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tanggal Lahir *</label>
              <input
                type="date"
                required
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Usia (Kalkulasi Sistem Otomatis) *</label>
              <input
                type="text"
                disabled
                value={usia}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kabupaten / Kota *</label>
              <select
                required
                value={formData.kabupatenKota}
                onChange={(e) => {
                  setFormData({ ...formData, kabupatenKota: e.target.value, kecamatan: "" });
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none"
              >
                <option value="" disabled hidden>Pilih Kabupaten / Kota...</option>
                {Object.keys(KALTIM_DATA).map((kab) => (
                  <option key={kab} value={kab}>{kab}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kecamatan Asal *</label>
              <select
                required
                disabled={!formData.kabupatenKota}
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled hidden>Pilih Kecamatan...</option>
                {kecamatanList.map((kec: string) => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Cabang Olahraga / Afiliasi Organisasi *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Atletik / Taekwondo"
                value={formData.cabangOlahraga}
                onChange={(e) => setFormData({ ...formData, cabangOlahraga: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp Aktif *</label>
              <input
                type="text"
                required
                placeholder="0812-xxxx-xxxx"
                value={formData.nomorTelepon}
                onChange={(e) => setFormData({ ...formData, nomorTelepon: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                 {errorMessage}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#006644] hover:bg-[#005533] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Mengirim data responden..." : "Simpan ke Basis Data Responden"}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Daftar Responden Terdaftar</h3>
            <p className="text-xs text-slate-500 mt-1">Data responden olahraga yang terintegrasi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-xs font-extrabold text-slate-400 tracking-wider">NO</th>
                <th className="pb-3 text-xs font-extrabold text-slate-400 tracking-wider">NAMA LENGKAP & NIK</th>
                <th className="pb-3 text-xs font-extrabold text-slate-400 tracking-wider">TANGGAL LAHIR</th>
                <th className="pb-3 text-xs font-extrabold text-slate-400 tracking-wider">DOMISILI & KECAMATAN</th>
                <th className="pb-3 text-xs font-extrabold text-slate-400 tracking-wider">CABANG OLAHRAGA</th>
                <th className="pb-3 text-xs font-extrabold text-slate-400 tracking-wider">NO. TELEPON / WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : respondens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">Belum ada data responden.</td>
                </tr>
              ) : (
                respondens.map((r, i) => (
                  <tr key={r.nik} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-slate-500 font-medium">{(page - 1) * 10 + i + 1}</td>
                    <td className="py-4">
                      <div className="font-bold text-slate-900">{r.nama}</div>
                      <div className="text-xs text-slate-500">NIK: {r.nik}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-slate-700">{new Date(r.tanggalLahir).toLocaleDateString("id-ID")}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-slate-900">{r.kabupatenKota}</div>
                      <div className="text-xs text-slate-500">{r.kecamatan}</div>
                    </td>
                    <td className="py-4 font-bold text-slate-700">{r.cabangOlahraga}</td>
                    <td className="py-4 font-medium text-slate-700">{r.nomorTelepon}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
          <span className="text-sm font-medium text-slate-500">
            Halaman {page} dari {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
