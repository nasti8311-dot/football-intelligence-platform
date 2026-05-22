import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const snapshots = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
      match: {
        kickoff: {
          gte: now,
          lte: in3Days,
        },
      },
    },
    include: {
      match: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          bookmakerOdds: true,
          odds: true,
        },
      },
    },
    orderBy: [
      {
        valueScore: "desc",
      },
      {
        probability: "desc",
      },
    ],
    take: 100,
  });

  const picks = snapshots
    .map((s) => {
      const oddsRows =
        (s.match.bookmakerOdds?.length || 0) +
        (s.match.odds?.length || 0);

      return {
        id: s.id,
        match: `${s.match.homeTeam?.name} vs ${s.match.awayTeam?.name}`,
        league: s.match.league?.name,
        kickoff: s.match.kickoff,
        market: s.market,
        pick: s.pick,
        probability: s.probability,
        confidence: s.confidence,
        valueScore: s.valueScore,
        oddsRows,
      };
    })
    .filter((p) => p.oddsRows > 0);

  return NextResponse.json({
    total: picks.length,
    picks,
  });
}
