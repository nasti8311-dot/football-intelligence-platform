import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { selectBestTip } from "@/lib/select-best-tip";
import { calculateGoalMarkets } from "@/lib/goal-markets";

export const dynamic = "force-dynamic";

function normalizeMatchKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|afc|sc|club|football|and|&|the)\b/g, "")
    .replace(/brighton hove albion/g, "brighton")
    .replace(/brighton and hove albion/g, "brighton")
    .replace(/manchester united/g, "man united")
    .replace(/manchester city/g, "man city")
    .replace(/newcastle united/g, "newcastle")
    .replace(/wolverhampton wanderers/g, "wolves")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

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

      const goalMarkets = calculateGoalMarkets(homeXg, awayXg);
      const over15 = goalMarkets.over15;
      const under35 = goalMarkets.under35;
      const over25 = Number(p.over25 || goalMarkets.over25);
      const btts = Number(p.bttsYes || goalMarkets.btts);

      const bestTip = selectBestTip({
        homeWin: Number(p.homeWin || 0),
        draw: Number(p.draw || 0),
        awayWin: Number(p.awayWin || 0),
        over25,
        bttsYes: btts,
        over15,
        under35,
      });

      return {
        id: p.id,
        match: `${p.match.homeTeam?.name} vs ${p.match.awayTeam?.name}`,
        league: p.match.league?.name || "Unknown",
        kickoff: p.match.kickoff,
        market: bestTip.market,
        pick: bestTip.pick,
        probability: bestTip.probability,
        confidence: oddsRows > 0 ? "Geprüft" : "Modell-Pick",
        valueScore: Math.round(bestTip.score || p.valueScore || 0),
        oddsRows,
        over15,
        under35,
        over25,
        btts,
        qualityScore: Number(bestTip.score || bestTip.probability || 0) + oddsRows,
      };
    })
    .filter((p) => p.probability >= 45)
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const withOdds = ranked.filter((p) => p.oddsRows > 0);
  const withoutOdds = ranked.filter((p) => p.oddsRows <= 0);

  const marketCounts = new Map<string, number>();
  const seenMatches = new Set<string>();
  const picks = [];

  for (const pick of [...withOdds, ...withoutOdds]) {
    const count = marketCounts.get(pick.market) || 0;
    const matchKey = normalizeMatchKey(pick.match);

    if (seenMatches.has(matchKey)) continue;
    if (count >= 4) continue;

    seenMatches.add(matchKey);
    marketCounts.set(pick.market, count + 1);
    picks.push(pick);

    if (picks.length >= 10) break;
  }

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    totalShown: picks.length,
    withOdds: picks.filter((p) => p.oddsRows > 0).length,
    modelOnly: picks.filter((p) => p.oddsRows <= 0).length,
    target: "3-10",
    picks,
  });
}
