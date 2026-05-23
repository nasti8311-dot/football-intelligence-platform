import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { estimateOver15, estimateUnder35 } from "@/lib/market-probabilities";

export const dynamic = "force-dynamic";

function scorePick(p: any) {
  const marketPenalty =
    p.market?.includes("Über 2.5") ? 12 :
    p.market?.includes("Unter 2.5") ? 6 :
    p.market?.includes("Beide") ? 3 :
    0;

  return Number(p.probability || 0) + Number(p.valueScore || 0) + Number(p.oddsRows || 0) - marketPenalty;
}

export async function GET() {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2);

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

  const ranked = rows
    .map((p) => {
      const oddsRows =
        (p.match.bookmakerOdds?.length || 0) +
        (p.match.odds?.length || 0);

      const homeXg = Number(p.homeXg || 1.35);
      const awayXg = Number(p.awayXg || 1.15);

      return {
        id: p.id,
        match: `${p.match.homeTeam?.name} vs ${p.match.awayTeam?.name}`,
        league: p.match.league?.name || "Unknown",
        kickoff: p.match.kickoff,
        market: p.market,
        pick: p.pick,
        probability: Number(p.probability || 0),
        confidence: oddsRows > 0 ? "Geprüft" : "Modell-Pick",
        valueScore: p.valueScore || 0,
        oddsRows,
        over15: estimateOver15(homeXg, awayXg),
        under35: estimateUnder35(homeXg, awayXg),
        qualityScore: scorePick({ ...p, oddsRows }),
      };
    })
    .filter((p) => p.probability >= 45)
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const withOdds = ranked.filter((p) => p.oddsRows > 0);
  const withoutOdds = ranked.filter((p) => p.oddsRows <= 0);

  const picks = [...withOdds, ...withoutOdds].slice(0, 10);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    totalShown: picks.length,
    withOdds: picks.filter((p) => p.oddsRows > 0).length,
    modelOnly: picks.filter((p) => p.oddsRows <= 0).length,
    target: "3-10",
    picks,
  });
}
