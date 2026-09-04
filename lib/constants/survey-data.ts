import { SurveySubmission } from "@/lib/types";

export interface IndicatorMeta {
  id: number;
  numberStr: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  requiredProof: string;
  focusHint: string;
}

export const SURVEY_INDICATORS: IndicatorMeta[] = [
  {
    id: 1,
    numberStr: "Indikator 1",
    title: "Kejuaraan Pelajar Tingkat Nasional dan Internasional",
    shortDesc: "Keikutsertaan kontingen pelajar (SD/SMP/SMA/SMK) yang menghasilkan prestasi medali.",
    fullDesc: "Seluruh kejuaraan atau kompetisi olahraga resmi yang diperuntukkan bagi peserta didik dari jenjang SD s/d SMA/SMK sederajat pada tingkat nasional maupun internasional yang menghasilkan medali.",
    requiredProof: "Surat Penugasan Resmi, Hasil Pertandingan Resmi, Sertifikat, atau Piagam Medali (PDF).",
    focusHint: "Hanya laporkan kejuaraan yang menghasilkan perolehan medali Emas, Perak, atau Perunggu.",
  },
  {
    id: 2,
    numberStr: "Indikator 2",
    title: "Peningkatan Mutu SDM Olahraga (Pelatih/Wasit/Juri)",
    shortDesc: "Pendidikan, pelatihan, penataran, atau sertifikasi lisensi nasional/internasional.",
    fullDesc: "Kegiatan peningkatan kompetensi teknis pelatih, wasit, atau juri yang diselenggarakan oleh kementerian, induk cabang olahraga, atau lembaga resmi pada tahun pelaporan.",
    requiredProof: "Sertifikat Kelulusan Resmi, SK Kelulusan Lisensi, atau Piagam Sertifikasi (PDF).",
    focusHint: "Data harus membuktikan peserta telah lulus dan dinyatakan memperoleh lisensi kompetensi.",
  },
  {
    id: 3,
    numberStr: "Indikator 3",
    title: "Pelatih Cabor Membawa Tim Tingkat Nasional & Internasional",
    shortDesc: "Pelatih domisili daerah yang mendapat penugasan resmi mendampingi kontingen.",
    fullDesc: "Pelatih yang berdomisili atau tercatat berasal dari kabupaten/kota serta memperoleh penugasan resmi dari induk cabor atau instansi pemerintah untuk memimpin tim.",
    requiredProof: "Surat Keputusan (SK) Penugasan Resmi atau Daftar Kontingen Terverifikasi (PDF).",
    focusHint: "Lampirkan bukti SK penugasan resmi dari instansi pemerintah atau Pengprov/PB Cabor.",
  },
  {
    id: 4,
    numberStr: "Indikator 4",
    title: "Wasit Cabang Olahraga Masuk dalam Wasit Nasional & Internasional",
    shortDesc: "Wasit daerah yang memiliki lisensi dan pengakuan aktif tingkat nasional/internasional.",
    fullDesc: "Wasit yang berasal dari kabupaten/kota dan memiliki pengakuan resmi serta sertifikasi aktif untuk memimpin kejuaraan tingkat nasional atau internasional sesuai regulasi cabor.",
    requiredProof: "Buku Lisensi Resmi, Kartu Tanda Wasit Nasional, atau Sertifikat Penetapan (PDF).",
    focusHint: "Pastikan masa berlaku lisensi wasit masih aktif pada tahun pelaporan berjalan.",
  },
  {
    id: 5,
    numberStr: "Indikator 5",
    title: "Wasit/Juri yang Bertugas pada Kegiatan Nasional & Internasional",
    shortDesc: "Penugasan aktif memimpin atau menilai jalannya pertandingan kejuaraan resmi.",
    fullDesc: "Wasit dan/atau juri yang secara faktual bertugas di arena kejuaraan nasional/internasional berdasarkan surat mandat resmi dari lembaga berwenang.",
    requiredProof: "Surat Tugas Resmi / Surat Mandat Pertandingan dari PB/PP Cabor atau Panpel (PDF).",
    focusHint: "Cantumkan nama event kejuaraan dan nomor surat tugas penugasan lapangan.",
  },
  {
    id: 6,
    numberStr: "Indikator 6",
    title: "Atlet Cabang Olahraga Mewakili Tim Nasional & Internasional",
    shortDesc: "Atlet daerah yang resmi memperkuat tim kontingen provinsi atau Indonesia.",
    fullDesc: "Atlet binaan kabupaten/kota yang ditetapkan melalui SK resmi sebagai anggota tim atau kontingen mewakili daerah, provinsi, atau Tim Nasional Indonesia.",
    requiredProof: "SK Penetapan Atlet Kontingen, Surat Pemanggilan Pelatnas/Pelatda, ID Card Event (PDF).",
    focusHint: "Sebutkan nama atlet, nomor pertandingan cabor, dan capaian pada kejuaraan tersebut.",
  },
  {
    id: 7,
    numberStr: "Indikator 7",
    title: "Penyelenggaraan Event Olahraga Nasional & Internasional",
    shortDesc: "Kejuaraan skala nasional/internasional yang diselenggarakan di wilayah daerah.",
    fullDesc: "Event olahraga bergengsi yang sukses digelar di wilayah kabupaten/kota oleh pemerintah daerah atau mitra swasta dengan partisipasi peserta lintas provinsi/negara.",
    requiredProof: "Buku Laporan Pertanggungjawaban (LPJ) Event, SK Tuan Rumah, atau Dokumentasi Resmi (PDF).",
    focusHint: "Sebutkan jumlah provinsi/kontingen peserta yang hadir di wilayah Anda.",
  },
  {
    id: 8,
    numberStr: "Indikator 8",
    title: "Prestasi Event Olahraga Masyarakat Tingkat Nasional",
    shortDesc: "Capaian dalam olahraga kebugaran, rekreasi, dan pelestarian budaya olahraga.",
    fullDesc: "Capaian daerah dalam penyelenggaraan maupun partisipasi pada festival/kejuaraan olahraga masyarakat (KORMI) yang berorientasi kebugaran dan kebersamaan.",
    requiredProof: "Piagam Partisipasi Resmi, Berita Acara Kegiatan, atau Laporan Kontingen (PDF).",
    focusHint: "Olahraga rekreasi masyarakat berbeda dengan olahraga prestasi; fokus pada partisipasi komunitas.",
  },
];

export const INITIAL_SUBMISSIONS: SurveySubmission[] = [
  {
    id: "SRV-2024-001",
    createdAt: "2024-05-20T10:30:00Z",
    tahunSurvei: 2024,
    responden: {
      namaLengkap: "Bambang Pamungkas, S.Pd.",
      umur: 38,
      jenisKelamin: "Laki-laki",
      kabupatenKota: "Kabupaten Sleman",
      kecamatan: "Depok",
      pekerjaan: "Pengurus Cabang Olahraga Atletik",
      nomorTelepon: "0812-3456-7890",
    },
    answers: {
      1: {
        indicatorId: 1,
        indicatorTitle: "Kejuaraan Pelajar Tingkat Nasional dan Internasional",
        namaKegiatan: "Kejuaraan Nasional Atletik Pelajar U-18",
        cabangOlahraga: "Atletik (Lari 100m & Lompat Jauh)",
        tingkatPenyelenggaraan: "Nasional",
        sumberPendanaan: "APBD",
        capaianPrestasi: "1 Emas (Lari 100m Putra) dan 1 Perak (Lompat Jauh Putri)",
        medaliEmas: 1,
        medaliPerak: 1,
        medaliPerunggu: 0,
        jumlahPeserta: 12,
        uraianKegiatan: "Kontingen pelajar Sleman berhasil meraih 1 emas dan 1 perak dalam Kejurnas Atletik Pelajar di Solo.",
        fileBuktiName: "SK_Kontingen_Kejurnas_Pelajar_2024.pdf",
        fileBuktiSize: "2.4 MB",
        fileBuktiHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
    },
    status: "TERVERIFIKASI",
    catatanVerifikator: "Dokumen SK dan piagam sah telah diverifikasi oleh Tim Dispora.",
    totalIndikatorTerisi: 8,
  },
  {
    id: "SRV-2024-002",
    createdAt: "2024-05-24T14:15:00Z",
    tahunSurvei: 2024,
    responden: {
      namaLengkap: "Dewi Sartika, M.Or.",
      umur: 32,
      jenisKelamin: "Perempuan",
      kabupatenKota: "Kota Yogyakarta",
      kecamatan: "Umbulharjo",
      pekerjaan: "Pelatih Renang Tingkat Daerah",
      nomorTelepon: "0813-9876-5432",
    },
    answers: {
      2: {
        indicatorId: 2,
        indicatorTitle: "Peningkatan Mutu SDM Olahraga (Pelatih/Wasit/Juri)",
        namaKegiatan: "Sertifikasi Pelatih Renang Nasional Level 2 PB PRSI",
        cabangOlahraga: "Akuatik / Renang",
        tingkatPenyelenggaraan: "Nasional",
        sumberPendanaan: "Swasta/Sponsorship",
        capaianPrestasi: "Lulus Ujian Kompetensi dengan Lisensi B Nasional",
        uraianKegiatan: "Mengikuti penataran dan ujian sertifikasi lisensi nasional selama 5 hari di Jakarta.",
        fileBuktiName: "Sertifikat_Pelatih_Nasional_DewiSartika.pdf",
        fileBuktiSize: "1.8 MB",
        fileBuktiHash: "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
      },
    },
    status: "TERKIRIM",
    catatanVerifikator: "Menunggu pemeriksaan fisik berkas oleh Verifikator Bidang Olahraga Prestasi.",
    totalIndikatorTerisi: 6,
  },
];
