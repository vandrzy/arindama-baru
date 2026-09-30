import { prisma } from "@/lib/prisma";

export interface WeightRow {
  id?: string;
  pilar: "PRESTASI" | "DISABILITAS" | "REKREASI";
  tingkat: "Internasional" | "Nasional" | "Provinsi";
  emas: number;
  perak: number;
  perunggu: number;
  partisipasi: number;
}

export const DEFAULT_WEIGHTS: WeightRow[] = [
  // PRESTASI
  { pilar: "PRESTASI", tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { pilar: "PRESTASI", tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { pilar: "PRESTASI", tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
  // DISABILITAS
  { pilar: "DISABILITAS", tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { pilar: "DISABILITAS", tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { pilar: "DISABILITAS", tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
  // REKREASI
  { pilar: "REKREASI", tingkat: "Internasional", emas: 85, perak: 65, perunggu: 45, partisipasi: 25 },
  { pilar: "REKREASI", tingkat: "Nasional", emas: 50, perak: 35, perunggu: 25, partisipasi: 15 },
  { pilar: "REKREASI", tingkat: "Provinsi", emas: 25, perak: 15, perunggu: 10, partisipasi: 5 },
];

/**
 * Get dynamic weights matrix from database.
 * If empty or incomplete, seeds default weight configuration automatically.
 */
export async function getDynamicWeights(): Promise<WeightRow[]> {
  try {
    let rows = await prisma.dynamicWeight.findMany({
      orderBy: { id: "asc" },
    });

    if (rows.length < DEFAULT_WEIGHTS.length) {
      // Seed missing default values
      for (const dw of DEFAULT_WEIGHTS) {
        await prisma.dynamicWeight.upsert({
          where: {
            pilar_tingkat: {
              pilar: dw.pilar,
              tingkat: dw.tingkat,
            },
          },
          update: {},
          create: dw,
        });
      }

      rows = await prisma.dynamicWeight.findMany({
        orderBy: { id: "asc" },
      });
    }

    const pilarOrder: Record<string, number> = { PRESTASI: 1, DISABILITAS: 2, REKREASI: 3 };
    const tingkatOrder: Record<string, number> = { Internasional: 1, Nasional: 2, Provinsi: 3 };

    return rows
      .map((r) => ({
        id: r.id,
        pilar: (r.pilar || "PRESTASI") as WeightRow["pilar"],
        tingkat: r.tingkat as WeightRow["tingkat"],
        emas: r.emas,
        perak: r.perak,
        perunggu: r.perunggu,
        partisipasi: r.partisipasi,
      }))
      .sort((a, b) => {
        const pDiff = (pilarOrder[a.pilar] || 99) - (pilarOrder[b.pilar] || 99);
        if (pDiff !== 0) return pDiff;
        return (tingkatOrder[a.tingkat] || 99) - (tingkatOrder[b.tingkat] || 99);
      });
  } catch (error) {
    console.error("Error getting dynamic weights:", error);
    return DEFAULT_WEIGHTS;
  }
}

/**
 * Update dynamic weights matrix in database.
 */
export async function updateDynamicWeights(
  newWeights: WeightRow[]
): Promise<WeightRow[]> {
  for (const item of newWeights) {
    await prisma.dynamicWeight.upsert({
      where: {
        pilar_tingkat: {
          pilar: item.pilar || "PRESTASI",
          tingkat: item.tingkat,
        },
      },
      update: {
        emas: Number(item.emas),
        perak: Number(item.perak),
        perunggu: Number(item.perunggu),
        partisipasi: Number(item.partisipasi),
      },
      create: {
        pilar: item.pilar || "PRESTASI",
        tingkat: item.tingkat,
        emas: Number(item.emas),
        perak: Number(item.perak),
        perunggu: Number(item.perunggu),
        partisipasi: Number(item.partisipasi),
      },
    });
  }

  return getDynamicWeights();
}

/**
 * Reset dynamic weights matrix to default Kemenpora standard.
 */
export async function resetDynamicWeights(): Promise<WeightRow[]> {
  for (const dw of DEFAULT_WEIGHTS) {
    await prisma.dynamicWeight.upsert({
      where: {
        pilar_tingkat: {
          pilar: dw.pilar,
          tingkat: dw.tingkat,
        },
      },
      update: {
        emas: dw.emas,
        perak: dw.perak,
        perunggu: dw.perunggu,
        partisipasi: dw.partisipasi,
      },
      create: dw,
    });
  }
  return getDynamicWeights();
}
