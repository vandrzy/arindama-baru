import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

const execAsync = promisify(exec);

const MAX_TARGET_SIZE = 1 * 1024 * 1024; // 1 MB limit
const MAX_UPLOAD_LIMIT = 15 * 1024 * 1024; // 15 MB max initial upload limit

/**
 * Mencari lokasi executable Ghostscript di sistem
 */
export function findGhostscriptBinary(): string | null {
  // 1. Cek environment variable GHOSTSCRIPT_PATH jika ditentukan
  if (process.env.GHOSTSCRIPT_PATH && fsSync.existsSync(process.env.GHOSTSCRIPT_PATH)) {
    return process.env.GHOSTSCRIPT_PATH;
  }

  // 2. Pada Windows, cari di PATH atau lokasi standar instalasi gs
  if (process.platform === "win32") {
    const commonDirs = [
      "C:\\Program Files\\gs",
      "C:\\Program Files (x86)\\gs",
      "C:\\gs",
    ];

    for (const baseDir of commonDirs) {
      if (fsSync.existsSync(baseDir)) {
        try {
          const subdirs = fsSync.readdirSync(baseDir);
          for (const subdir of subdirs) {
            const binDir = path.join(baseDir, subdir, "bin");
            if (fsSync.existsSync(binDir)) {
              const files = fsSync.readdirSync(binDir);
              const exe = files.find(
                (f) =>
                  f.toLowerCase() === "gswin64c.exe" ||
                  f.toLowerCase() === "gswin32c.exe" ||
                  f.toLowerCase() === "gs.exe"
              );
              if (exe) {
                return path.join(binDir, exe);
              }
            }
          }
        } catch {
          // Abaikan jika direktori tidak dapat dibaca
        }
      }
    }
    // Fallback perintah gs atau gswin64c di PATH
    return "gswin64c";
  }

  // 3. Pada Linux / macOS, default 'gs'
  return "gs";
}

export interface CompressPdfResult {
  success: boolean;
  finalPath: string;
  finalSize: number;
  compressed: boolean;
  error?: string;
}

/**
 * Kompresi PDF menggunakan Ghostscript agar ukuran file maksimal 1 MB
 */
export async function compressPdfWithGhostscript(
  inputPath: string,
  outputPath: string,
  targetMaxBytes: number = MAX_TARGET_SIZE
): Promise<CompressPdfResult> {
  try {
    const inputStats = await fs.stat(inputPath);
    const initialSize = inputStats.size;

    // Jika ukuran sudah <= 1 MB, tidak perlu dikompresi
    if (initialSize <= targetMaxBytes) {
      if (inputPath !== outputPath) {
        await fs.copyFile(inputPath, outputPath);
      }
      return {
        success: true,
        finalPath: outputPath,
        finalSize: initialSize,
        compressed: false,
      };
    }

    const gsBinary = findGhostscriptBinary();
    if (!gsBinary) {
      return {
        success: false,
        finalPath: inputPath,
        finalSize: initialSize,
        compressed: false,
        error: "Ghostscript (gs) tidak ditemukan di server.",
      };
    }

    // Opsi 1: Coba kompresi medium (/ebook - 150 dpi)
    const tempEbookPath = `${outputPath}.ebook.tmp.pdf`;
    const cmdEbook = `"${gsBinary}" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${tempEbookPath}" "${inputPath}"`;

    try {
      await execAsync(cmdEbook);
      const ebookStats = await fs.stat(tempEbookPath);

      if (ebookStats.size <= targetMaxBytes) {
        await fs.rename(tempEbookPath, outputPath);
        return {
          success: true,
          finalPath: outputPath,
          finalSize: ebookStats.size,
          compressed: true,
        };
      }

      // Hapus file temp ebook jika masih > 1 MB
      await fs.unlink(tempEbookPath).catch(() => {});
    } catch (err: any) {
      console.warn("Ghostscript /ebook compression failed:", err?.message || err);
    }

    // Opsi 2: Jika /ebook masih > 1 MB, coba kompresi lebih tinggi (/screen - 72 dpi)
    const tempScreenPath = `${outputPath}.screen.tmp.pdf`;
    const cmdScreen = `"${gsBinary}" -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${tempScreenPath}" "${inputPath}"`;

    try {
      await execAsync(cmdScreen);
      const screenStats = await fs.stat(tempScreenPath);

      if (screenStats.size <= targetMaxBytes) {
        await fs.rename(tempScreenPath, outputPath);
        return {
          success: true,
          finalPath: outputPath,
          finalSize: screenStats.size,
          compressed: true,
        };
      }

      // Jika masih > 1 MB tetapi lebih kecil dari ukuran asli, kita periksa toleransi atau tolak
      // Hapus file temp screen
      await fs.unlink(tempScreenPath).catch(() => {});

      return {
        success: false,
        finalPath: inputPath,
        finalSize: initialSize,
        compressed: false,
        error: `Ukuran file PDF (${(initialSize / (1024 * 1024)).toFixed(2)} MB) masih melebihi 1 MB setelah dikompresi. Harap kurangi jumlah halaman atau resolusi elemen dalam PDF.`,
      };
    } catch (err: any) {
      console.error("Ghostscript /screen compression error:", err?.message || err);
      
      // Jika Ghostscript gagal karena binary tidak ada di PATH saat dieksekusi
      return {
        success: false,
        finalPath: inputPath,
        finalSize: initialSize,
        compressed: false,
        error: `Gagal mengeksekusi Ghostscript untuk mengompresi PDF: ${err?.message || "Perintah tidak ditemukan"}`,
      };
    }
  } catch (error: any) {
    console.error("compressPdfWithGhostscript error:", error);
    return {
      success: false,
      finalPath: inputPath,
      finalSize: 0,
      compressed: false,
      error: error?.message || "Terjadi kesalahan saat mengompresi PDF.",
    };
  }
}
