import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function scorePick(p: any) {
  const marketPenalty =
    p.market?.includes("Über 2.5") ? 12 :
    p.market?.includes("Unter 2.5") ? 6 :
    p.market?.includes("Beide") ? 3 :
    0;

  return Number(p.probability || 0) + Number(p.valueScore || 0) - marketPenalty;
}

export async function GET() {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
      match: {
        kickoff: {
          gte: now,
          lte: end,
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
    take: 250,
  });

  const picks = rows
    .map((p) => {
      const oddsRows =
        (p.match.bookmakerOdds?.length || 0) +
        (p.match.odds?.length || 0);

      return {
        id: p.id,
        match: `${p.match.homeTeam?.name} vs ${p.match.awayTeam?.name}`,
        league: p.match.league?.name || "Unknown",
        kickoff: p.match.kickoff,
        market: p.market,
        pick: p.pick,
        probability: Number(p.probability || 0),
        confidence: p.confidence || "Model",
        valueScore: p.valueScore || 0,
        oddsRows,
        qualityScore: scorePick(p) + oddsRows,
      };
    })
    .filter((p) => p.oddsRows > 0)
    .filter((p) => p.probability >= 48)
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    totalShown: picks.length,
    minTarget: 3,
    maxTarget: 10,
    picks,
  });
}
