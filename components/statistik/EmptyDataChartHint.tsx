import React from "react";
import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";

export default function EmptyDataChartHint({ title }: { title: string }) {
  return (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
      <div className="p-3 rounded-full bg-teal-50 text-brand-primary">
        <BarChart3 className="w-6 h-6" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-xs font-bold text-brand-text">{title}</h4>
        <p className="text-xs text-brand-text-secondary">
          Data grafik belum tersedia karena entri kuesioner pada indikator ini belum diisikan.
        </p>
      </div>
      <Link
        href="/kuesioner"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary-hover shadow-subtle transition-all"
      >
        <span>Isi Kuesioner Sekarang</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
