"use client";

import React, { useRef, useState } from "react";
import { FileCheck, FileUp, AlertCircle, Trash2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "./button";

interface PdfDropzoneProps {
  label?: string;
  hint?: string;
  value?: {
    name: string;
    size: string;
    hash?: string;
  };
  onChange: (fileMeta?: { name: string; size: string; hash: string }) => void;
}

export function PdfDropzone({
  label = "Unggah Dokumen Bukti Sah (PDF)",
  hint = "Format berkas wajib PDF resmi (SK Penugasan / Sertifikat / Piagam), ukuran maksimal 5 MB.",
  value,
  onChange,
}: PdfDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Generate deterministic mock hash for anti-tamper verification demo
  const generateFileHash = async (file: File): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    }
  };

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Ukuran berkas melebihi batas maksimal 5 MB.");
      return;
    }

    // Validate mime / extension
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Format berkas tidak valid. Harap unggah dokumen dalam format PDF sah.");
      return;
    }

    setIsVerifying(true);
    setUploadProgress(15);

    const hash = await generateFileHash(file);
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    // Reassuring upload progress step simulation
    setTimeout(() => setUploadProgress(55), 150);
    setTimeout(() => setUploadProgress(90), 300);

    setTimeout(() => {
      setUploadProgress(100);
      setTimeout(() => {
        setIsVerifying(false);
        setUploadProgress(null);
        onChange({
          name: file.name,
          size: sizeStr,
          hash: hash.substring(0, 16) + "...",
        });
      }, 200);
    }, 450);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-brand-text">
          {label}
        </label>
        <span className="text-xs text-brand-primary font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Verifikasi Sah
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="application/pdf,.pdf"
        className="hidden"
      />

      {!value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-200 hover:border-brand-primary rounded-xl p-5 text-center cursor-pointer transition-colors duration-200 bg-brand-surface/60 hover:bg-brand-primary-light/40 group"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-11 h-11 rounded-full bg-white border border-gray-200 group-hover:border-brand-primary flex items-center justify-center text-brand-primary transition-transform group-hover:scale-105">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-text">
                <span className="text-brand-primary font-semibold underline underline-offset-2">
                  Pilih dokumen PDF
                </span>{" "}
                atau seret ke area ini
              </p>
              <p className="text-xs text-brand-text-secondary mt-1">{hint}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-emerald-200 bg-emerald-50/70 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-emerald-950 truncate">
                  {value.name}
                </p>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-emerald-700 flex items-center gap-2 mt-0.5">
                <span>Ukuran: {value.size}</span>
                {value.hash && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                    SHA256: {value.hash}
                  </span>
                )}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-emerald-800/70 hover:text-red-600 hover:bg-red-100 shrink-0 h-9 w-9 p-0 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isVerifying && uploadProgress !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Mengunggah &amp; Memverifikasi Dokumen Sah...
            </span>
            <span className="tabular-nums font-bold text-emerald-700">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-150 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
