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
    orderBy: {
      createdAt: "desc",
    },
    take: 3000,
  });

  const byMarket: any = {};

  for (const row of rows) {
    if (!byMarket[row.market]) {
      byMarket[row.market] = {
        total: 0,
        wins: 0,
        avgProb: 0,
      };
    }

    byMarket[row.market].total++;

    if (row.isCorrect) {
      byMarket[row.market].wins++;
    }

    byMarket[row.market].avgProb += row.probability;
  }

  const insights = Object.entries(byMarket).map(([market, v]: any) => ({
    market,
    total: v.total,
    wins: v.wins,
    accuracy:
      v.total > 0
        ? Number(((v.wins / v.total) * 100).toFixed(2))
        : 0,
    avgProbability:
      v.total > 0
        ? Number((v.avgProb / v.total).toFixed(2))
        : 0,
  }));

  return NextResponse.json({
    totalPredictions: rows.length,
    insights,
  });
}
