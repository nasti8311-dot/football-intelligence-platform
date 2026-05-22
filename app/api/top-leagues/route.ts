import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
        lte: in3Days,
      },
    },
    include: {
      league: true,
      bookmakerOdds: true,
      odds: true,
    },
    take: 500,
  });

  const map: Record<string, { matches: number; withOdds: number; oddsRows: number }> = {};

  for (const match of matches) {
    const league = match.league?.name || "Unknown";
    const oddsRows = (match.bookmakerOdds?.length || 0) + (match.odds?.length || 0);

    if (!map[league]) {
      map[league] = {
        matches: 0,
        withOdds: 0,
        oddsRows: 0,
      };
    }

    map[league].matches++;
    map[league].oddsRows += oddsRows;
    if (oddsRows > 0) map[league].withOdds++;
  }

  const leagues = Object.entries(map)
    .map(([league, v]) => ({
      league,
      ...v,
      score: v.withOdds * 10 + v.oddsRows,
      coverage: v.matches > 0 ? Number(((v.withOdds / v.matches) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({
    total: leagues.length,
    recommendedFreeTierLeagues: leagues.slice(0, 5),
    allLeagues: leagues,
  });
}
