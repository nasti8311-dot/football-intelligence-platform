import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.predictionSnapshot.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5000,
  });

  const map: Record<string, number> = {};

  for (const row of rows) {
    map[row.market] = (map[row.market] || 0) + 1;
  }

  return NextResponse.json({
    total: rows.length,
    distribution: Object.entries(map)
      .map(([market, count]) => ({
        market,
        count,
      }))
      .sort((a, b) => b.count - a.count),
  });
}
