import {
  UserCheck,
  FileSpreadsheet,
  Laptop,
  UploadCloud,
  ShieldCheck,
  BarChart3,
  LucideIcon,
} from "lucide-react";

export interface SurveyTemplateItem {
  id: number;
  title: string;
  file: string;
  desc: string;
}

export interface FlowStepItem {
  step: number;
  title: string;
  desc: string;
  icon: LucideIcon;
  tag: string;
}

export const SURVEY_TEMPLATES: SurveyTemplateItem[] = [
  {
    id: 1,
    title: "Kategori 1: Data Responden",
    file: "KAT 01_Data Responden.xlsx",
    desc: "Data identitas responden, NIK, jenis kelamin, domisili, dan kontak.",
  },
  {
    id: 2,
    title: "Kategori 2: Kejuaraan Atlet Pelajar Berjenjang",
    file: "KAT 02_Kejuaraan Atlet Pelajar Berjenjang.xlsx",
    desc: "Data partisipasi dan perolehan medali pada kejuaraan pelajar tingkat nasional & internasional.",
  },
  {
    id: 3,
    title: "Kategori 3: Peningkatan Mutu SDM Olahraga",
    file: "KAT 03_Peningkatan Mutu SDM Olahraga.xlsx",
    desc: "Sertifikasi, pelatihan, dan program peningkatan kapasitas SDM keolahragaan daerah.",
  },
  {
    id: 4,
    title: "Kategori 4: Pelatih Berlisensi Mendampingi Kontingen",
    file: "KAT 04_Pelatih Berlisensi Mendampingi Kontingen.xlsx",
    desc: "Rekam jejak pelatih cabang olahraga yang mendampingi tim nasional atau internasional.",
  },
  {
    id: 5,
    title: "Kategori 5: Wasit & Juri Terakreditasi",
    file: "KAT 05_Wasit & Juri Terakreditasi.xlsx",
    desc: "Data lisensi resmi wasit cabang olahraga tingkat nasional maupun internasional.",
  },
  {
    id: 6,
    title: "Kategori 6: Penugasan Wasit & Juri Pertandingan",
    file: "KAT 06_Penugasan Wasit & Juri Pertandingan.xlsx",
    desc: "Penugasan aktif wasit dan juri daerah pada kegiatan olahraga resmi skala nasional/internasional.",
  },
  {
    id: 7,
    title: "Kategori 7: Atlet Daerah Mewakili Kontingen & Timnas",
    file: "KAT 07_Atlet Daerah Mewakili Kontingen & Timnas.xlsx",
    desc: "Data atlet daerah yang terpilih memperkuat tim nasional pada ajang internasional.",
  },
  {
    id: 8,
    title: "Kategori 8: Penyelenggaraan Event Keolahragaan Daerah",
    file: "KAT 08_Penyelenggaraan Event Keolahragaan Daerah.xlsx",
    desc: "Laporan pelaksanaan kejuaraan dan kegiatan keolahragaan yang diselenggarakan di daerah.",
  },
  {
    id: 9,
    title: "Kategori 9: Olahraga Masyarakat, Tradisional & Rekreasi",
    file: "KAT 09_Olahraga Masyarakat, Tradisional & Rekreasi.xlsx",
    desc: "Capaian prestasi pada festival dan kejuaraan olahraga masyarakat tingkat nasional.",
  },
];

export const FLOW_STEPS: FlowStepItem[] = [
  {
    step: 1,
    title: "Daftar / Masuk (Login)",
    desc: "Buat akun untuk instansi Anda atau masuk menggunakan kredensial yang sudah ada.",
    icon: UserCheck,
    tag: "Tahap Akun & Profil",
  },
  {
    step: 2,
    title: "Unduh Template Excel",
    desc: "Unduh template form ke-9 Kategori (format .xlsx) yang tersedia di halaman beranda.",
    icon: FileSpreadsheet,
    tag: "Tersedia di Dasbor",
  },
  {
    step: 3,
    title: "Isi Data Secara Offline",
    desc: "Lengkapi seluruh data capaian pada template Excel menggunakan aplikasi spreadsheet (Microsoft Excel / WPS) di komputer Anda secara offline.",
    icon: Laptop,
    tag: "Input Mandiri Tanpa Kuota",
  },
  {
    step: 4,
    title: "Unggah Kuesioner (Upload)",
    desc: "Masuk ke menu dasbor \"Isi Kuesioner\", lalu unggah file Excel Kategori tersebut secara bersamaan.",
    icon: UploadCloud,
    tag: "Upload Berkas Kategori",
  },
  {
    step: 5,
    title: "Unggah Bukti Validasi",
    desc: "Beralih ke menu \"Validasi\" di dasbor. Unggah berkas bukti pendukung berupa dokumen PDF (contoh: sertifikat, SK) untuk tiap-tiap capaian.",
    icon: ShieldCheck,
    tag: "Verifikasi Keabsahan Data",
  },
  {
    step: 6,
    title: "Selesai & Pantau Hasil",
    desc: "Lihat hasil akumulasi data olahraga Anda di Dashboard Utama secara real-time.",
    icon: BarChart3,
    tag: "Akumulasi & Peringkat Nasional",
  },
];

export const FULL_TEMPLATE_NAMES: Record<number, string> = {
  1: "KAT 01_Data Responden.xlsx",
  2: "KAT 02_Kejuaraan Atlet Pelajar Berjenjang.xlsx",
  3: "KAT 03_Peningkatan Mutu SDM Olahraga.xlsx",
  4: "KAT 04_Pelatih Berlisensi Mendampingi Kontingen.xlsx",
  5: "KAT 05_Wasit & Juri Terakreditasi.xlsx",
  6: "KAT 06_Penugasan Wasit & Juri Pertandingan.xlsx",
  7: "KAT 07_Atlet Daerah Mewakili Kontingen & Timnas.xlsx",
  8: "KAT 08_Penyelenggaraan Event Keolahragaan Daerah.xlsx",
  9: "KAT 09_Olahraga Masyarakat, Tradisional & Rekreasi.xlsx",
};

export const EXPECTED_FILE_NAMES: Record<number, string[]> = {
  1: ["KAT 01", "Data Responden", "Responden", "Kategori 1"],
  2: ["KAT 02", "Kejuaraan Atlet Pelajar", "Kategori 2", "Indikator 1"],
  3: ["KAT 03", "Peningkatan Mutu SDM", "Kategori 3", "Indikator 2"],
  4: ["KAT 04", "Pelatih Berlisensi", "Kategori 4", "Indikator 3"],
  5: ["KAT 05", "Wasit & Juri Terakreditasi", "Kategori 5", "Indikator 4"],
  6: ["KAT 06", "Penugasan Wasit", "Kategori 6", "Indikator 5"],
  7: ["KAT 07", "Atlet Daerah", "Kategori 7", "Indikator 6"],
  8: ["KAT 08", "Penyelenggaraan Event", "Kategori 8", "Indikator 7"],
  9: ["KAT 09", "Olahraga Masyarakat", "Kategori 9", "Indikator 8"],
};

export function isValidFileName(step: number, fileName: string): boolean {
  const keywords = EXPECTED_FILE_NAMES[step];
  if (!keywords) return true;
  return keywords.some((keyword) => fileName.toLowerCase().includes(keyword.toLowerCase()));
}
