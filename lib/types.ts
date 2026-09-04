export type UserRole = "RESPONDEN" | "ADMIN";

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  jabatan?: string;
  instansi?: string;
}

export interface RespondentIdentity {
  namaLengkap: string;
  umur: number | string;
  jenisKelamin: "Laki-laki" | "Perempuan" | "";
  kabupatenKota: string;
  kecamatan: string;
  pekerjaan: string;
  nomorTelepon: string;
}

export interface SurveyAnswer {
  indicatorId: number;
  indicatorTitle: string;
  namaKegiatan: string;
  cabangOlahraga: string;
  tingkatPenyelenggaraan: "Nasional" | "Internasional" | "";
  sumberPendanaan: "APBD" | "APBN" | "Swasta/Sponsorship" | "Kombinasi" | "";
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
}

export interface SurveySubmission {
  id: string;
  createdAt: string;
  tahunSurvei: number;
  responden: RespondentIdentity;
  answers: Record<number, SurveyAnswer>;
  status: "DRAFT" | "TERKIRIM" | "TERVERIFIKASI" | "PERLU_REVISI";
  catatanVerifikator?: string;
  totalIndikatorTerisi: number;
}
