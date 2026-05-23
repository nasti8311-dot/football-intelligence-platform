import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function randomBetween(min: number, max: number) {
  return Number((min + Math.random() * (max - min)).toFixed(2));
}

function pickMarket(homeWin: number, draw: number, awayWin: number) {
  if (homeWin >= awayWin && homeWin >= draw) {
    return {
      market: "1X2",
      pick: "Home Win",
      probability: homeWin,
    };
  }

  if (awayWin >= homeWin && awayWin >= draw) {
    return {
      market: "1X2",
      pick: "Away Win",
      probability: awayWin,
    };
  }

  return {
    market: "1X2",
    pick: "Draw",
    probability: draw,
  };
}

export async function GET() {
  try {
    const now = new Date();
    const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

    const matches = await prisma.match.findMany({
      where: {
        kickoff: {
          gte: now,
          lte: end,
        },
      },
      include: {
        bookmakerOdds: true,
        odds: true,
      },
      take: 40,
    });

    let saved = 0;

    for (const match of matches) {
      const existing = await prisma.predictionSnapshot.findFirst({
        where: {
          matchId: match.id,
          isCorrect: null,
        },
      });

      if (existing) continue;

      const homeWin = randomBetween(35, 65);
      const draw = randomBetween(15, 30);
      const awayWin = Number((100 - homeWin - draw).toFixed(2));

      const over25 = randomBetween(45, 78);
      const under25 = Number((100 - over25).toFixed(2));

      const bttsYes = randomBetween(40, 75);
      const bttsNo = Number((100 - bttsYes).toFixed(2));

      const marketPick = pickMarket(homeWin, draw, awayWin);

      await prisma.predictionSnapshot.create({
        data: {
          matchId: match.id,

          market: marketPick.market,
          pick: marketPick.pick,
          probability: marketPick.probability,

          homeWin,
          draw,
          awayWin,

          over25,
          under25,

          bttsYes,
          bttsNo,

          confidence:
            marketPick.probability >= 70
              ? "A"
              : marketPick.probability >= 60
              ? "B"
              : "C",

          valueScore: Math.round(marketPick.probability / 10),
        },
      });

      saved++;
    }

    return NextResponse.json({
      ok: true,
      matches: matches.length,
      predictionsSaved: saved,
    });
  } catch (e: any) {
    console.error(e);

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
