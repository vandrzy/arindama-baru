import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-card max-w-md w-full space-y-3">
        <h1 className="text-4xl font-extrabold text-brand-primary">404</h1>
        <h2 className="text-lg font-bold text-gray-900">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Maaf, halaman yang Anda tuju tidak ditemukan atau URL mungkin salah.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
