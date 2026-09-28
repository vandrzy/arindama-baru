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
    title: "Identitas Responden",
    file: "IdentitasResponden_Fixed.xlsx",
    desc: "Form isian profil instansi, kontak penanggung jawab, dan data wilayah administratif.",
  },
  {
    id: 2,
    title: "Indikator 1: Kejuaraan Pelajar",
    file: "Indikator 1_Kejuaraan Pelajar Tingkat Nasional dan Internasional.xlsx",
    desc: "Data partisipasi dan perolehan medali pada kejuaraan pelajar tingkat nasional & internasional.",
  },
  {
    id: 3,
    title: "Indikator 2: Peningkatan Mutu SDM Olahraga",
    file: "Indikator 2_Peningkatan Mutu SDM Olahraga.xlsx",
    desc: "Sertifikasi, pelatihan, dan program peningkatan kapasitas SDM keolahragaan daerah.",
  },
  {
    id: 4,
    title: "Indikator 3: Pelatih Cabor Membawa Tim",
    file: "Indikator 3_Pelatih Cabor Membawa Tim Tingkat Nasional Internasional.xlsx",
    desc: "Rekam jejak pelatih cabang olahraga yang mendampingi tim nasional atau internasional.",
  },
  {
    id: 5,
    title: "Indikator 4: Wasit Cabor Lisensi Nasional/Int.",
    file: "Indikator 4_ Wasit Cabang Olahraga Masuk dalam Wasit Nasional Internasional.xlsx",
    desc: "Data lisensi resmi wasit cabang olahraga tingkat nasional maupun internasional.",
  },
  {
    id: 6,
    title: "Indikator 5: Wasit / Juri Bertugas di Event",
    file: "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional.xlsx",
    desc: "Penugasan aktif wasit dan juri daerah pada kegiatan olahraga resmi skala nasional/internasional.",
  },
  {
    id: 7,
    title: "Indikator 6: Atlet Membawa Nama Timnas",
    file: "Indikator 6_Atlet Cabang Olahraga Mewakili Tim Nasional Internasional.xlsx",
    desc: "Data atlet daerah yang terpilih memperkuat tim nasional pada ajang internasional.",
  },
  {
    id: 8,
    title: "Indikator 7: Penyelenggaraan Event Olahraga",
    file: "Indikator 7_Penyelenggaraan Event Olahraga Nasional Internasional.xlsx",
    desc: "Laporan pelaksanaan kejuaraan dan kegiatan keolahragaan yang diselenggarakan di daerah.",
  },
  {
    id: 9,
    title: "Indikator 8: Prestasi Olahraga Masyarakat",
    file: "Indikator 8_Prestasi Event Olahraga Masyarakat Tingkat Nasional.xlsx",
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
    desc: "Unduh template form Identitas dan ke-8 form Indikator (format .xlsx) yang tersedia di halaman beranda.",
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
    desc: "Masuk ke menu dasbor \"Isi Kuesioner\", lalu unggah ke-9 file Excel tersebut secara bersamaan.",
    icon: UploadCloud,
    tag: "Upload 9 Berkas Sekaligus",
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
    title: "Selesai & Pantau Statistik",
    desc: "Lihat hasil akumulasi data olahraga Anda di menu \"Statistik\" secara real-time.",
    icon: BarChart3,
    tag: "Akumulasi & Peringkat Nasional",
  },
];

export const FULL_TEMPLATE_NAMES: Record<number, string> = {
  0: "IdentitasResponden_Fixed.xlsx",
  1: "Indikator 1_Kejuaraan Pelajar Tingkat Nasional dan Internasional.xlsx",
  2: "Indikator 2_Peningkatan Mutu SDM Olahraga.xlsx",
  3: "Indikator 3_Pelatih Cabor Membawa Tim Tingkat Nasional Internasional.xlsx",
  4: "Indikator 4_ Wasit Cabang Olahraga Masuk dalam Wasit Nasional Internasional.xlsx",
  5: "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional.xlsx",
  6: "Indikator 6_Atlet Cabang Olahraga Mewakili Tim Nasional Internasional.xlsx",
  7: "Indikator 7_Penyelenggaraan Event Olahraga Nasional Internasional.xlsx",
  8: "Indikator 8_Prestasi Event Olahraga Masyarakat Tingkat Nasional.xlsx",
};

export const EXPECTED_FILE_NAMES: Record<number, string[]> = {
  0: ["IdentitasResponden"],
  1: ["Indikator 1"],
  2: ["Indikator 2"],
  3: ["Indikator 3"],
  4: ["Indikator 4"],
  5: [
    "Indikator 5_ WasitJuri yang Bertugas pada Kegiatan Nasional Internasional",
    "Indikator 5_WasitJuri yang Bertugas pada Kegiatan Nasional Internasional",
    "Indikator 5",
  ],
  6: ["Indikator 6"],
  7: ["Indikator 7"],
  8: ["Indikator 8"],
};

export function isValidFileName(step: number, fileName: string): boolean {
  const keywords = EXPECTED_FILE_NAMES[step];
  if (!keywords) return true;
  return keywords.some((keyword) => fileName.includes(keyword));
}
