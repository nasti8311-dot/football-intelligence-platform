import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const in3Days = new Date();
  in3Days.setDate(now.getDate() + 3);

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

  const byLeague = new Map<string, {
    matches: number;
    withOdds: number;
    oddsRows: number;
  }>();

  for (const match of matches) {
    const league = match.league?.name || "Unbekannt";
    const current = byLeague.get(league) || {
      matches: 0,
      withOdds: 0,
      oddsRows: 0,
    };

    const oddsRows =
      (match.bookmakerOdds?.length || 0) +
      (match.odds?.length || 0);

    current.matches += 1;
    current.oddsRows += oddsRows;

    if (oddsRows > 0) {
      current.withOdds += 1;
    }

    byLeague.set(league, current);
  }

  return NextResponse.json({
    totalMatches: matches.length,
    totalWithOdds: matches.filter(
      (m) =>
        (m.bookmakerOdds?.length || 0) +
          (m.odds?.length || 0) >
        0
    ).length,
    byLeague: Array.from(byLeague.entries()).map(([league, stats]) => ({
      league,
      ...stats,
      coverage:
        stats.matches > 0
          ? Number(((stats.withOdds / stats.matches) * 100).toFixed(1))
          : 0,
    })),
  });
}
