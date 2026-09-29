import { prisma } from "@/lib/prisma";

export interface WeightRow {
  id?: string;
  tingkat: "Internasional" | "Nasional" | "Provinsi";
  emas: number;
  perak: number;
  perunggu: number;
  partisipasi: number;
}

export const DEFAULT_WEIGHTS: WeightRow[] = [
  { tingkat: "Internasional", emas: 100, perak: 75, perunggu: 50, partisipasi: 25 },
  { tingkat: "Nasional", emas: 60, perak: 45, perunggu: 30, partisipasi: 15 },
  { tingkat: "Provinsi", emas: 30, perak: 20, perunggu: 15, partisipasi: 10 },
];

/**
 * Get dynamic weights matrix from database.
 * If empty, seeds default weight configuration automatically.
 */
export async function getDynamicWeights(): Promise<WeightRow[]> {
  try {
    let rows = await prisma.dynamicWeight.findMany({
      orderBy: { id: "asc" },
    });

    if (rows.length === 0) {
      // Seed default values
      for (const dw of DEFAULT_WEIGHTS) {
        await prisma.dynamicWeight.upsert({
          where: { tingkat: dw.tingkat },
          update: {},
          create: dw,
        });
      }

      rows = await prisma.dynamicWeight.findMany({
        orderBy: { id: "asc" },
      });
    }

    // Sort order: Internasional, Nasional, Provinsi
    const orderMap: Record<string, number> = {
      Internasional: 1,
      Nasional: 2,
      Provinsi: 3,
    };

    return rows
      .map((r) => ({
        id: r.id,
        tingkat: r.tingkat as WeightRow["tingkat"],
        emas: r.emas,
        perak: r.perak,
        perunggu: r.perunggu,
        partisipasi: r.partisipasi,
      }))
      .sort((a, b) => (orderMap[a.tingkat] || 99) - (orderMap[b.tingkat] || 99));
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
      where: { tingkat: item.tingkat },
      update: {
        emas: Number(item.emas),
        perak: Number(item.perak),
        perunggu: Number(item.perunggu),
        partisipasi: Number(item.partisipasi),
      },
      create: {
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
