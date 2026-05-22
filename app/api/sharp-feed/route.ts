import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const picks = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
      probability: {
        gte: 60,
      },
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
      { valueScore: "desc" },
      { probability: "desc" },
    ],
    take: 50,
  });

  const sharp = picks
    .map((p) => {
      const oddsRows =
        (p.match.bookmakerOdds?.length || 0) +
        (p.match.odds?.length || 0);

      return {
        id: p.id,
        match: `${p.match.homeTeam?.name} vs ${p.match.awayTeam?.name}`,
        league: p.match.league?.name,
        kickoff: p.match.kickoff,
        market: p.market,
        pick: p.pick,
        probability: p.probability,
        confidence: p.confidence,
        valueScore: p.valueScore,
        oddsRows,
      };
    })
    .filter((p) => p.oddsRows > 0);

  return NextResponse.json({
    total: sharp.length,
    picks: sharp,
  });
}
