'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 max-w-md w-full space-y-4 shadow-card">
        <h2 className="text-lg font-bold text-amber-900">Terjadi Kesalahan Halaman</h2>
        <p className="text-xs text-amber-800 leading-relaxed">
          {error?.message || "Halaman tidak dapat dimuat dengan benar."}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary/90 transition-colors"
        >
          Coba Muat Ulang
        </button>
      </div>
    </div>
  );
}
