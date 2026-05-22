import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
    take: 5000,
  });

  const byMarket: Record<string, { total: number; wins: number }> = {};

  for (const row of rows) {
    if (!byMarket[row.market]) {
      byMarket[row.market] = { total: 0, wins: 0 };
    }

    byMarket[row.market].total++;

    if (row.isCorrect) {
      byMarket[row.market].wins++;
    }
  }

  const warnings = Object.entries(byMarket)
    .map(([market, s]) => {
      const accuracy = s.total > 0 ? (s.wins / s.total) * 100 : 0;

      if (s.total >= 20 && accuracy < 50) {
        return {
          market,
          severity: "HIGH",
          accuracy: Number(accuracy.toFixed(1)),
          total: s.total,
          message: "Markt performt unter 50% und sollte abgewertet werden.",
        };
      }

      if (s.total >= 20 && accuracy < 55) {
        return {
          market,
          severity: "MEDIUM",
          accuracy: Number(accuracy.toFixed(1)),
          total: s.total,
          message: "Markt ist instabil und braucht strengere Filter.",
        };
      }

      return null;
    })
    .filter(Boolean);

  return NextResponse.json({
    totalWarnings: warnings.length,
    warnings,
  });
}
