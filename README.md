# ARINDAMA SPORT SURVEY

Aplikasi kuesioner keolahragaan terpadu untuk pengumpulan data dan evaluasi capaian prestasi olahraga nasional & internasional tingkat kabupaten/kota Provinsi Kalimantan Timur.

## Tentang Aplikasi

ARINDAMA Sport Survey adalah platform berbasis web untuk:

- **Responden** — Mengisi kuesioner 16 indikator keolahragaan secara bertahap, lengkap dengan upload dokumen bukti PDF sah
- **Admin / Verifikator Dispora** — Mengelola dan memverifikasi seluruh kuesioner yang masuk melalui dashboard audit

## Teknologi

- Next.js 14.2
- React 18.3
- TypeScript 5.7
- Tailwind CSS 3.4
- Prisma 5.22.0 + PostgreSQL
- Lucide Icons 0.469

## Cara Menjalankan

### Prasyarat

- Node.js versi 18 atau lebih baru
- npm (sudah termasuk bersama Node.js)
- PostgreSQL (untuk production)

### Instalasi

```bash
# Clone repository
git clone <url-repo-anda>
cd arindama

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local sesuai konfigurasi database Anda

# Jalankan server development
npm run dev
```

Buka browser dan akses: http://localhost:3000

### Login Development

Akun default sudah di-seed otomatis saat pertama kali membuka aplikasi:

**Admin:**
- Username: `admin`
- Email: `admin@arindama.id`
- Password: `Admin#2024`

**Responden:**
- Username: `responden`
- Email: `responden@arindama.id`
- Password: `User#2024`

> **Catatan:** Development accounts di-seed ke localStorage pada first load. Production menggunakan database yang di-setup via `prisma/seed.ts`.

### Build untuk Produksi

```bash
npm run build
npm start
```

## Alur Penggunaan

### Sebagai Responden

1. Login dengan akun responden
2. Klik "Isi Kuesioner" di navbar
3. Isi data identitas diri
4. Jawab 16 indikator keolahragaan
5. Upload dokumen bukti PDF
6. Tinjau dan kirimkan kuesioner

### Sebagai Admin

1. Login dengan akun admin
2. Klik "Portal Admin" di navbar
3. Lihat dashboard statistik
4. Audit dan verifikasi kuesioner responden

## Struktur Folder

```
arindama/
├── app/
│   ├── page.tsx          # Beranda
│   ├── login/            # Halaman login
│   ├── register/         # Halaman registrasi
│   ├── kuesioner/        # Form kuesioner 16 indikator
│   ├── riwayat/          # Riwayat pengisian
│   ├── admin/            # Dashboard admin & audit
│   └── api/              # API endpoints
├── components/
│   ├── navbar.tsx        # Navigasi utama
│   └── ui/               # Komponen UI reusable
├── lib/
│   ├── context/          # App context (auth, state)
│   ├── constants/        # Data indikator
│   ├── prisma.ts         # Database client
│   └── auth.ts           # Auth utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── public/               # Static assets
```

## Fitur Utama

- Form kuesioner 16 indikator keolahragaan
- Upload dokumen PDF sebagai bukti
- Dashboard admin untuk verifikasi
- Manajemen user (register, login, role)
- Responsive design (mobile-first)
- Data Kab/Kota Kalimantan Timur (7 kabupaten + 4 kota)

## Lisensi

Dikembangkan untuk Dinas Pemuda dan Olahraga Provinsi Kalimantan Timur.
