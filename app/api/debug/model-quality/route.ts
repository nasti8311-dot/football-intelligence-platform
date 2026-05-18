import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const overview: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE "isCorrect" IS NOT NULL)::int as evaluated,
      COUNT(*) FILTER (WHERE "isCorrect" = true)::int as correct
    FROM "PredictionSnapshot"
  `).catch(() => [{
    total: 0,
    evaluated: 0,
    correct: 0,
  }]);

  const markets: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      market,
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE "isCorrect" = true)::int as correct
    FROM "PredictionSnapshot"
    GROUP BY market
    ORDER BY total DESC
  `).catch(() => []);

  return NextResponse.json({
    ok: true,
    overview: overview[0],
    markets,
  });
}
