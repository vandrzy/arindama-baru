export type UserRole = "RESPONDEN" | "ADMIN";

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  jabatan?: string;
  instansi?: string;
  kabupatenKota?: string;
}

export interface RespondentIdentity {
  namaLengkap: string;
  umur: number | string;
  jenisKelamin: "Laki-laki" | "Perempuan" | "";
  kabupatenKota: string;
  kecamatan: string;
  pekerjaan: string;
  instansi?: string;
  jabatan?: string;
  nomorTelepon: string;
  fileBuktiName?: string;
}

export interface SurveyAnswer {
  indicatorId: number;
  indicatorTitle: string;
  namaKegiatan: string;
  cabangOlahraga: string;
  tingkatPenyelenggaraan: "Nasional" | "Internasional" | "";
  sumberPendanaan: "APBD" | "APBN" | "Swasta/Sponsorship" | "Kombinasi" | "Mandiri" | "";
  capaianPrestasi?: string;
  medaliEmas?: number;
  medaliPerak?: number;
  medaliPerunggu?: number;
  jumlahPeserta?: number;
  nomorSuratTugas?: string;
  uraianKegiatan: string;
  fileBuktiName?: string;
  fileBuktiSize?: string;
  fileBuktiHash?: string;
  fileBuktiUrl?: string;
  bobotNilai?: number; // Bobot nilai otomatis (Partisipasi=1, Event/Prestasi=3, SDM=2)
  tingkatWilayah?: "Kabupaten/Kota" | "Provinsi" | "Nasional" | "Internasional" | "";
}

export interface SurveySubmission {
  id: string;
  noRegistrasi: string;
  createdAt: string;
  tahunSurvei: number;
  responden: RespondentIdentity;
  user?: {
    nama?: string;
    instansi?: string;
    jabatan?: string;
    kabupatenKota?: string;
  };
  totalIndikatorTerisi: number;
}

