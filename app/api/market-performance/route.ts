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

  const markets: any = {};

  for (const row of rows) {
    if (!markets[row.market]) {
      markets[row.market] = {
        total: 0,
        wins: 0,
      };
    }

    markets[row.market].total++;

    if (row.isCorrect) {
      markets[row.market].wins++;
    }
  }

  return NextResponse.json(
    Object.entries(markets).map(([market, v]: any) => ({
      market,
      total: v.total,
      accuracy:
        v.total > 0
          ? Number(((v.wins / v.total) * 100).toFixed(2))
          : 0,
    }))
  );
}
