import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePoissonMarkets } from "@/lib/poisson-football";
import { selectBestTip } from "@/lib/select-best-tip";

export const dynamic = "force-dynamic";

function randomBetween(min: number, max: number) {
  return Number((min + Math.random() * (max - min)).toFixed(2));
}

export async function GET() {
  try {
    const now = new Date();
    const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2);

    const matches = await prisma.match.findMany({
      where: {
        kickoff: {
          gte: now,
          lte: end,
        },
      },
      take: 40,
    });

    await prisma.predictionSnapshot.deleteMany({
      where: {
        isCorrect: null,
      },
    });

    let saved = 0;

    for (const match of matches) {
      const homeXg = randomBetween(0.8, 2.3);
      const awayXg = randomBetween(0.6, 2.1);

      const markets = calculatePoissonMarkets(homeXg, awayXg);

      const bestTip = selectBestTip({
        homeWin: markets.homeWin,
        draw: markets.draw,
        awayWin: markets.awayWin,
        over25: markets.over25,
        bttsYes: markets.bttsYes,
        over15: markets.over15,
        under35: markets.under35,
      });

      await prisma.predictionSnapshot.create({
        data: {
          matchId: match.id,

          market: bestTip.market,
          pick: bestTip.pick,
          probability: bestTip.probability,

          homeWin: markets.homeWin,
          draw: markets.draw,
          awayWin: markets.awayWin,

          over25: markets.over25,
          under25: Number((100 - markets.over25).toFixed(2)),

          bttsYes: markets.bttsYes,
          bttsNo: markets.bttsNo,

          homeXg,
          awayXg,

          confidence:
            bestTip.probability >= 75
              ? "A"
              : bestTip.probability >= 65
              ? "B"
              : "C",

          valueScore: Math.round(bestTip.score),
        },
      });

      saved++;
    }

    return NextResponse.json({
      ok: true,
      model: "poisson_xg",
      matches: matches.length,
      predictionsSaved: saved,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "unknown_error",
      },
      {
        status: 500,
      }
    );
  }
}
