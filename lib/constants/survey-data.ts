import { SurveySubmission } from "@/lib/types";

export interface CategoryMeta {
  id: number;
  numberStr: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  requiredProof: string;
  focusHint: string;
  bobotNilai: number; // Bobot: Partisipasi=1, SDM=2, Event/Prestasi=3
  tingkatWilayah: "Kabupaten/Kota" | "Provinsi"; // Tingkat wilayah kategori
  keteranganInklusif?: string; // Keterangan inklusivitas penyandang disabilitas
}

export type IndicatorMeta = CategoryMeta;

export const SURVEY_CATEGORIES: CategoryMeta[] = [
  {
    id: 1,
    numberStr: "Kategori 1",
    title: "Data Responden / Identitas Olahragawan & Tenaga Keolahragaan",
    shortDesc: "Pendataan identitas responden/atlet, NIK, jenis kelamin, domisili, dan nomor kontak.",
    fullDesc: "Data identitas lengkap responden atau atlet daerah yang berpartisipasi dalam pengisian data kuesioner keolahragaan.",
    requiredProof: "Dokumen identitas resmi (KTP / KK / Berkas Bukti Sah Responden - PDF).",
    focusHint: "Pastikan data NIK, nama lengkap, dan wilayah sesuai dokumen resmi.",
    bobotNilai: 1,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Termasuk data responden penyandang disabilitas yang tercatat resmi.",
  },
  {
    id: 2,
    numberStr: "Kategori 2",
    title: "Kejuaraan Atlet Pelajar Berjenjang",
    shortDesc: "Keikutsertaan kontingen pelajar (SD/SMP/SMA/SMK) yang menghasilkan prestasi medali.",
    fullDesc: "Seluruh kejuaraan atau kompetisi olahraga resmi yang diperuntukkan bagi peserta didik dari jenjang SD s/d SMA/SMK sederajat pada tingkat nasional maupun internasional yang menghasilkan medali.",
    requiredProof: "Surat Penugasan Resmi, Hasil Pertandingan Resmi, Sertifikat, atau Piagam Medali (PDF).",
    focusHint: "Hanya laporkan kejuaraan yang menghasilkan perolehan medali Emas, Perak, atau Perunggu.",
    bobotNilai: 3,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Termasuk pelajar penyandang disabilitas yang berprestasi dalam kejuaraan ini.",
  },
  {
    id: 3,
    numberStr: "Kategori 3",
    title: "Peningkatan Mutu SDM Olahraga",
    shortDesc: "Pendidikan, pelatihan, penataran, atau sertifikasi lisensi nasional/internasional.",
    fullDesc: "Kegiatan peningkatan kompetensi teknis pelatih, wasit, atau juri yang diselenggarakan oleh kementerian, induk cabang olahraga, atau lembaga resmi pada tahun pelaporan.",
    requiredProof: "Sertifikat Kelulusan Resmi, SK Kelulusan Lisensi, atau Piagam Sertifikasi (PDF).",
    focusHint: "Data harus membuktikan peserta telah lulus dan dinyatakan memperoleh lisensi kompetensi.",
    bobotNilai: 2,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Termasuk pelatih/wasit/juri penyandang disabilitas yang memperoleh sertifikasi dan lisensi.",
  },
  {
    id: 4,
    numberStr: "Kategori 4",
    title: "Pelatih Berlisensi Mendampingi Kontingen",
    shortDesc: "Pelatih domisili daerah yang mendapat penugasan resmi mendampingi kontingen.",
    fullDesc: "Pelatih yang berdomisili atau tercatat berasal dari kabupaten/kota serta memperoleh penugasan resmi dari induk cabor atau instansi pemerintah untuk memimpin tim.",
    requiredProof: "Surat Keputusan (SK) Penugasan Resmi atau Daftar Kontingen Terverifikasi (PDF).",
    focusHint: "Lampirkan bukti SK penugasan resmi dari instansi pemerintah atau Pengprov/PB Cabor.",
    bobotNilai: 2,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Termasuk pelatih yang mendampingi tim paralimpik atau tim inklusif penyandang disabilitas.",
  },
  {
    id: 5,
    numberStr: "Kategori 5",
    title: "Wasit & Juri Terakreditasi",
    shortDesc: "Wasit daerah yang memiliki lisensi dan pengakuan aktif tingkat nasional/internasional.",
    fullDesc: "Wasit yang berasal dari kabupaten/kota dan memiliki pengakuan resmi serta sertifikasi aktif untuk memimpin kejuaraan tingkat nasional atau internasional sesuai regulasi cabor.",
    requiredProof: "Buku Lisensi Resmi, Kartu Tanda Wasit Nasional, atau Sertifikat Penetapan (PDF).",
    focusHint: "Pastikan masa berlaku lisensi wasit masih aktif pada tahun pelaporan berjalan.",
    bobotNilai: 2,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Termasuk wasit penyandang disabilitas yang memiliki lisensi aktif dan diakui secara resmi.",
  },
  {
    id: 6,
    numberStr: "Kategori 6",
    title: "Penugasan Wasit & Juri Pertandingan",
    shortDesc: "Penugasan aktif memimpin atau menilai jalannya pertandingan kejuaraan resmi.",
    fullDesc: "Wasit dan/atau juri yang secara faktual bertugas di arena kejuaraan nasional/internasional berdasarkan surat mandat resmi dari lembaga berwenang.",
    requiredProof: "Surat Tugas Resmi / Surat Mandat Pertandingan dari PB/PP Cabor atau Panpel (PDF).",
    focusHint: "Cantumkan nama event kejuaraan dan nomor surat tugas penugasan lapangan.",
    bobotNilai: 2,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Termasuk wasit/juri penyandang disabilitas yang ditugaskan secara resmi pada kegiatan nasional/internasional.",
  },
  {
    id: 7,
    numberStr: "Kategori 7",
    title: "Atlet Daerah Mewakili Kontingen & Timnas",
    shortDesc: "Atlet daerah yang resmi memperkuat tim kontingen provinsi atau Indonesia.",
    fullDesc: "Atlet binaan kabupaten/kota yang ditetapkan melalui SK resmi sebagai anggota tim atau kontingen mewakili daerah, provinsi, atau Tim Nasional Indonesia.",
    requiredProof: "SK Penetapan Atlet Kontingen, Surat Pemanggilan Pelatnas/Pelatda, ID Card Event (PDF).",
    focusHint: "Sebutkan nama atlet, nomor pertandingan cabor, dan capaian pada kejuaraan tersebut.",
    bobotNilai: 3,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Termasuk atlet penyandang disabilitas yang mewakili tim kontingen paralimpik atau tim inklusif.",
  },
  {
    id: 8,
    numberStr: "Kategori 8",
    title: "Penyelenggaraan Event Keolahragaan Daerah",
    shortDesc: "Kejuaraan skala nasional/internasional yang diselenggarakan di wilayah daerah.",
    fullDesc: "Event olahraga bergengsi yang sukses digelar di wilayah kabupaten/kota oleh pemerintah daerah atau mitra swasta dengan partisipasi peserta lintas provinsi/negara.",
    requiredProof: "Buku Laporan Pertanggungjawaban (LPJ) Event, SK Tuan Rumah, atau Dokumentasi Resmi (PDF).",
    focusHint: "Sebutkan jumlah provinsi/kontingen peserta yang hadir di wilayah Anda.",
    bobotNilai: 3,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Event harus menyelenggarakan venue dan fasilitas yang aksesibel bagi peserta penyandang disabilitas.",
  },
  {
    id: 9,
    numberStr: "Kategori 9",
    title: "Olahraga Masyarakat, Tradisional & Rekreasi",
    shortDesc: "Capaian dalam olahraga kebugaran, rekreasi, dan pelestarian budaya olahraga.",
    fullDesc: "Capaian daerah dalam penyelenggaraan maupun partisipasi pada festival/kejuaraan olahraga masyarakat (KORMI) yang berorientasi kebugaran dan kebersamaan.",
    requiredProof: "Piagam Partisipasi Resmi, Berita Acara Kegiatan, atau Laporan Kontingen (PDF).",
    focusHint: "Olahraga rekreasi masyarakat berbeda dengan olahraga prestasi; fokus pada partisipasi komunitas.",
    bobotNilai: 1,
    tingkatWilayah: "Kabupaten/Kota",
    keteranganInklusif: "Event harus membuka partisipasi bagi masyarakat penyandang disabilitas dan kelompok rentan lainnya.",
  },
];

export const SURVEY_INDICATORS = SURVEY_CATEGORIES;

export const INITIAL_SUBMISSIONS: SurveySubmission[] = [];

export const KABUPATEN_KOTA_OPTIONS = [
  "Berau",
  "Kutai Barat",
  "Kutai Kartanegara",
  "Kutai Timur",
  "Mahakam Ulu",
  "Paser",
  "Penajam Paser Utara",
  "Balikpapan",
  "Bontang",
  "Samarinda",
];

export const INSTANSI_OPTIONS = [
  "DISPORA",
  "KONI",
  "KORMI",
  "NPC Indonesia",
];
