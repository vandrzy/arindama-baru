# 🏅 ARINDAMA SPORT SURVEY

Aplikasi kuesioner keolahragaan terpadu untuk pengumpulan data dan evaluasi capaian prestasi olahraga nasional & internasional tingkat kabupaten/kota.

## 📋 Tentang Aplikasi

ARINDAMA Sport Survey adalah platform berbasis web untuk:

- **Responden** — Mengisi kuesioner 8 indikator keolahragaan secara bertahap, lengkap dengan upload dokumen bukti PDF sah.
- **Admin / Verifikator Dispora** — Mengelola dan memverifikasi seluruh kuesioner yang masuk melalui dashboard audit.

## 🛠️ Teknologi

| Teknologi | Versi |
|-----------|-------|
| Next.js | 14.2 |
| React | 18.3 |
| TypeScript | 5.7 |
| Tailwind CSS | 3.4 |
| Lucide Icons | 0.469 |

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** versi 18 atau lebih baru — [Download di sini](https://nodejs.org/)
- **npm** (sudah termasuk bersama Node.js)

### Langkah Instalasi

```bash
# 1. Clone repository
git clone <url-repo-anda>

# 2. Masuk ke folder project
cd arindama-project-2

# 3. Install dependencies
npm install

# 4. Jalankan server development
npm run dev
```

Setelah berhasil, buka browser dan akses:

```
http://localhost:3000
```

> Jika port 3000 sudah terpakai, Next.js otomatis mencari port lain (3001, 3002, dst). Cek terminal untuk melihat port yang aktif.

### Build untuk Produksi

```bash
# Build
npm run build

# Jalankan server produksi
npm start
```

### Alur Penggunaan

**Sebagai Responden:**
1. Buka halaman Login → masuk dengan akun responden
2. Klik "Isi Kuesioner" di navbar
3. Isi data identitas diri
4. Jawab 8 indikator keolahragaan satu per satu
5. Upload dokumen bukti PDF di setiap indikator
6. Tinjau jawaban → Kirimkan kuesioner

**Sebagai Admin:**
1. Buka halaman Login → masuk dengan akun admin
2. Klik "Portal Admin" di navbar
3. Lihat dashboard statistik (total submisi, terverifikasi, menunggu, perlu revisi)
4. Klik baris tabel untuk membuka detail & audit dokumen
5. Verifikasi atau minta revisi pada kuesioner responden

## 📁 Struktur Folder

```
arindama-project-2/
├── app/                  # Halaman aplikasi (Next.js App Router)
│   ├── page.tsx          # Beranda
│   ├── login/            # Halaman login
│   ├── kuesioner/        # Form kuesioner 8 indikator
│   ├── riwayat/          # Riwayat pengisian
│   ├── admin/            # Dashboard admin & audit
│   ├── layout.tsx        # Layout global (navbar + footer)
│   └── globals.css       # Variabel warna & style global
├── components/           # Komponen UI reusable
│   ├── navbar.tsx        # Navigasi utama
│   ├── brand-logo.tsx    # Logo ARINDAMA
│   └── ui/               # Button, Card, Badge, PdfDropzone, dll
├── lib/                  # Logic & data
│   ├── context/          # App context (auth, state management)
│   ├── constants/        # Data indikator & submisi awal
│   └── types.ts          # TypeScript type definitions
├── tailwind.config.ts    # Konfigurasi Tailwind CSS
├── package.json          # Dependencies & scripts
└── README.md             # Dokumentasi ini
```
