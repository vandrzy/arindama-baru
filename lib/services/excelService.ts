import * as XLSX from "xlsx";
import { z } from "zod";

export interface ValidationErrorDetail {
  file: string;
  step: number;
  row?: number;
  field?: string;
  message: string;
}

export interface ParsedIndicatorRecordData {
  indicatorId: number;
  namaKegiatan: string;
  cabangOlahraga: string;
  tingkatPenyelenggaraan: string;
  sumberPendanaan: string;
  medali: string | null;
  uraianCapaian: string;
}

export interface ExcelParseResult {
  indicatorRecords: ParsedIndicatorRecordData[];
  errors: ValidationErrorDetail[];
}

function normalizeHeader(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function formatCellValue(val: any): string {
  if (val === null || val === undefined) return "";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    return val.toISOString().split("T")[0];
  }
  return String(val).trim();
}

// Zod schemas for row content validation
const identitasZodSchema = z.object({
  namaLengkap: z.string().min(1, "Nama Lengkap & Gelar wajib diisi"),
  jenisKelamin: z.string().min(1, "Jenis Kelamin wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal Lahir wajib diisi"),
  umur: z.string().min(1, "Umur wajib diisi"),
  kabupatenKotaAsal: z.string().min(1, "Kabupaten/ Kota Asal wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  pekerjaanJabatan: z.string().min(1, "Pekerjaan/ Jabatan di Bidang Olahraga wajib diisi"),
  nomorTelepon: z.string().min(1, "Nomor Telepon/ Whatsapp Aktif wajib diisi"),
});

const indicatorZodSchema = z.object({
  indicatorId: z.number().int(),
  namaKegiatan: z.string().min(1, "Nama Kegiatan/ Kejuaraan Olahraga wajib diisi"),
  cabangOlahraga: z.string().min(1, "Cabang Olahraga wajib diisi"),
  tingkatPenyelenggaraan: z.string().optional().default("Tk. Provinsi"),
  sumberPendanaan: z.string().optional().default("APBD/Dispora"),
  medali: z.string().nullable().optional(),
  uraianCapaian: z.string().optional().default("-"),
});

// Dictionary of allowed headers per column index
const IDENTITY_COLUMN_ALIASES: Record<number, { name: string; aliases: string[] }> = {
  0: { name: "Nama Lengkap & Gelar", aliases: ["nama", "nama lengkap", "nama lengkap & gelar"] },
  1: { name: "Jenis Kelamin", aliases: ["jenis kelamin", "kelamin", "jk"] },
  2: { name: "Tanggal Lahir", aliases: ["tanggal lahir", "tgl lahir", "tgl"] },
  3: { name: "Umur", aliases: ["umur", "usia"] },
  4: { name: "Kabupaten/ Kota Asal", aliases: ["kabupaten", "kota", "kabupaten/ kota asal", "kabupaten/kota asal", "kabupaten / kota asal", "kabupaten kota asal", "asal"] },
  5: { name: "Kecamatan", aliases: ["kecamatan"] },
  6: { name: "Pekerjaan/ Jabatan di Bidang Olahraga", aliases: ["pekerjaan", "jabatan", "pekerjaan/ jabatan di bidang olahraga", "pekerjaan/jabatan di bidang olahraga", "pekerjaan / jabatan di bidang olahraga", "pekerjaan/jabatan"] },
  7: { name: "Nomor Telepon/ Whatsapp Aktif", aliases: ["nomor telepon", "telepon", "whatsapp", "wa", "hp", "nomor telepon/ whatsapp aktif", "nomor telepon/whatsapp aktif", "nomor telepon / whatsapp aktif", "nomor whatsapp"] },
};

const INDICATOR_WITH_MEDAL_ALIASES: Record<number, { name: string; aliases: string[] }> = {
  0: { name: "Nama Kegiatan/ Kejuaraan Olahraga", aliases: ["nama kegiatan", "kegiatan", "kejuaraan", "nama kegiatan/ kejuaraan olahraga", "nama kegiatan/kejuaraan olahraga", "nama kegiatan / kejuaraan olahraga"] },
  1: { name: "Cabang Olahraga", aliases: ["cabang olahraga", "cabor"] },
  2: { name: "Tingkat Penyelenggara", aliases: ["tingkat", "tingkat penyelenggara", "tingkat penyelenggaraan"] },
  3: { name: "Sumber Pendanaan", aliases: ["pendanaan", "sumber pendanaan", "sumber"] },
  4: { name: "Medali", aliases: ["medali", "perolehan medali"] },
  5: { name: "Uraian Capaian", aliases: ["uraian", "capaian", "uraian capaian"] },
};

const INDICATOR_STANDARD_ALIASES: Record<number, { name: string; aliases: string[] }> = {
  0: { name: "Nama Kegiatan/ Kejuaraan Olahraga", aliases: ["nama kegiatan", "kegiatan", "kejuaraan", "nama kegiatan/ kejuaraan olahraga", "nama kegiatan/kejuaraan olahraga", "nama kegiatan / kejuaraan olahraga"] },
  1: { name: "Cabang Olahraga", aliases: ["cabang olahraga", "cabor"] },
  2: { name: "Tingkat Penyelenggaraan", aliases: ["tingkat", "tingkat penyelenggaraan", "tingkat penyelenggara"] },
  3: { name: "Sumber Pendanaan", aliases: ["pendanaan", "sumber pendanaan", "sumber"] },
  4: { name: "Uraian Capaian", aliases: ["uraian", "capaian", "uraian capaian"] },
};

/**
 * Validates header row against exact template specifications.
 */
function checkTemplateHeaders(
  headers: string[],
  aliasesConfig: Record<number, { name: string; aliases: string[] }>
): { valid: boolean; missing: string[]; colIndices: Record<string, number> } {
  const missing: string[] = [];
  const colIndices: Record<string, number> = {};

  for (const colIdxStr of Object.keys(aliasesConfig)) {
    const idx = parseInt(colIdxStr);
    const config = aliasesConfig[idx];
    
    // Check if the header at idx matches any of the allowed aliases
    const actualHeader = headers[idx] || "";
    const isMatch = config.aliases.some((alias) => actualHeader.includes(alias) || alias.includes(actualHeader));

    if (isMatch) {
      colIndices[config.name] = idx;
    } else {
      // Fallback: search across all headers in case user inserted a column
      const fallbackIdx = headers.findIndex((h) => config.aliases.some((alias) => h.includes(alias) || alias.includes(h)));
      if (fallbackIdx !== -1) {
        colIndices[config.name] = fallbackIdx;
      } else {
        missing.push(config.name);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    colIndices,
  };
}

/**
 * Ensures worksheet '!ref' boundary covers all actual cells present in the worksheet object.
 * Fixes issue where edited Excel files with outdated '!ref' metadata fail to read rows after row 1.
 */
export function fixWorksheetRange(worksheet: XLSX.WorkSheet): void {
  if (!worksheet) return;

  let minRow = Infinity;
  let minCol = Infinity;
  let maxRow = -1;
  let maxCol = -1;

  for (const key of Object.keys(worksheet)) {
    if (key.startsWith("!")) continue;
    try {
      const cell = XLSX.utils.decode_cell(key);
      if (cell.r < minRow) minRow = cell.r;
      if (cell.c < minCol) minCol = cell.c;
      if (cell.r > maxRow) maxRow = cell.r;
      if (cell.c > maxCol) maxCol = cell.c;
    } catch {
      // ignore non-cell properties
    }
  }

  if (minRow !== Infinity && maxRow !== -1 && minCol !== Infinity && maxCol !== -1) {
    if (worksheet["!ref"]) {
      try {
        const existingRef = XLSX.utils.decode_range(worksheet["!ref"]);
        minRow = Math.min(minRow, existingRef.s.r);
        minCol = Math.min(minCol, existingRef.s.c);
        maxRow = Math.max(maxRow, existingRef.e.r);
        maxCol = Math.max(maxCol, existingRef.e.c);
      } catch {
        // ignore invalid existing !ref
      }
    }
    worksheet["!ref"] = XLSX.utils.encode_range({
      s: { r: minRow, c: minCol },
      e: { r: maxRow, c: maxCol },
    });
  }
}

/**
 * Parses and validates a single Excel file on disk.
 */
export function parseAndValidateExcelFile(
  fileBuffer: Buffer | ArrayBuffer,
  step: number,
  fileName: string
): ExcelParseResult {
  const errors: ValidationErrorDetail[] = [];
  const indicatorRecords: ParsedIndicatorRecordData[] = [];

  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true, raw: false });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      errors.push({
        file: fileName,
        step,
        message: "File Excel tidak memiliki sheet yang valid.",
      });
      return { indicatorRecords, errors };
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      errors.push({
        file: fileName,
        step,
        message: `Sheet '${sheetName}' tidak dapat dibaca.`,
      });
      return { indicatorRecords, errors };
    }

    // Fix cell range boundary in case !ref was outdated
    fixWorksheetRange(worksheet);

    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (!rawRows || rawRows.length === 0) {
      errors.push({
        file: fileName,
        step,
        message: "File Excel kosong.",
      });
      return { indicatorRecords, errors };
    }

    // Identify header row (first non-empty row)
    let headerRowIndex = -1;
    for (let i = 0; i < rawRows.length; i++) {
      if (rawRows[i] && rawRows[i].some((c) => c !== null && c !== undefined && String(c).trim() !== "")) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      errors.push({
        file: fileName,
        step,
        message: "Header tidak ditemukan dalam file Excel.",
      });
      return { indicatorRecords, errors };
    }

    const rawHeaders = rawRows[headerRowIndex].map(normalizeHeader);
    const dataRows = rawRows.slice(headerRowIndex + 1);

    // Step 1 to 8: Indicator files
    const aliasesConfig = (step === 1 || step === 6) ? INDICATOR_WITH_MEDAL_ALIASES : INDICATOR_STANDARD_ALIASES;
    const headerCheck = checkTemplateHeaders(rawHeaders, aliasesConfig);

      if (!headerCheck.valid) {
        errors.push({
          file: fileName,
          step,
          row: headerRowIndex + 1,
          message: `Header template Indikator ${step} tidak sesuai. Kolom tidak ditemukan / salah: ${headerCheck.missing.join(", ")}`,
        });
        return { indicatorRecords, errors };
      }

      const idxMap = headerCheck.colIndices;

      for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
        const row = dataRows[rIdx];
        if (!row || !row.some((c) => c !== null && c !== undefined && String(c).trim() !== "")) {
          continue; // Skip empty rows
        }

        const displayRow = headerRowIndex + 2 + rIdx;

        const rawRecord = {
          indicatorId: step,
          namaKegiatan: formatCellValue(row[idxMap["Nama Kegiatan/ Kejuaraan Olahraga"]]),
          cabangOlahraga: formatCellValue(row[idxMap["Cabang Olahraga"]]),
          tingkatPenyelenggaraan: formatCellValue(row[idxMap[(step === 1 || step === 6) ? "Tingkat Penyelenggara" : "Tingkat Penyelenggaraan"]]),
          sumberPendanaan: formatCellValue(row[idxMap["Sumber Pendanaan"]]),
          medali: (step === 1 || step === 6) && idxMap["Medali"] !== undefined ? formatCellValue(row[idxMap["Medali"]]) || null : null,
          uraianCapaian: formatCellValue(row[idxMap["Uraian Capaian"]]),
        };

        const valResult = indicatorZodSchema.safeParse(rawRecord);
        if (!valResult.success) {
          for (const issue of valResult.error.issues) {
            errors.push({
              file: fileName,
              step,
              row: displayRow,
              field: issue.path.join("."),
              message: `Baris ${displayRow}: ${issue.message}`,
            });
          }
        } else {
          indicatorRecords.push({
            ...valResult.data,
            indicatorId: step,
          } as ParsedIndicatorRecordData);
        }
      }
  } catch (err: any) {
    errors.push({
      file: fileName,
      step,
      message: `Gagal membaca file Excel: ${err?.message || String(err)}`,
    });
  }

  return { indicatorRecords, errors };
}
