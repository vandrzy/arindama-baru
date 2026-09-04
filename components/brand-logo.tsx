import React from "react";

export function BrandLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Athletic Shield Badge Logo matching arindama.jpeg */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Outer Shield with Gold Accent Border */}
        <path
          d="M50 6L88 20V50C88 74 50 94 50 94C50 94 12 74 12 50V20L50 6Z"
          fill="#0D5C3A"
          stroke="#F59E0B"
          strokeWidth="4"
        />
        {/* Inner Golden Athletic Torch / Runner Silhouette */}
        <circle cx="50" cy="28" r="7" fill="#F59E0B" />
        <path
          d="M50 38C44 38 36 44 34 52L44 54L42 74L48 74L51 60L56 74L62 74L58 52L66 48L64 42L50 38Z"
          fill="#F59E0B"
        />
        <path
          d="M34 52L24 45L27 41L36 47L34 52Z"
          fill="#F59E0B"
        />
        <path
          d="M66 48L76 43L74 38L64 44L66 48Z"
          fill="#F59E0B"
        />
      </svg>
    </div>
  );
}
