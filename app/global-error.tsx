'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-card max-w-md w-full border border-gray-100 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900">Terjadi Kesalahan Sistem</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            {error?.message || "Aplikasi mengalami kendala tak terduga."}
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900 transition-colors shadow-sm"
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      </body>
    </html>
  );
}
