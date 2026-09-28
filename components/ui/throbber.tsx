import React from "react";

export default function Throbber({ message = "Memuat data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full min-h-[200px] gap-3">
      <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-medium text-gray-600 animate-pulse">
        {message}
      </p>
    </div>
  );
}
