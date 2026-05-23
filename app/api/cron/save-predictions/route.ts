import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function randomMarket() {
  const markets = [
    {
      market: "1X2",
      pick: "Home Win",
    },
    {
      market: "Über 2.5",
      pick: "Over 2.5",
    },
    {
      market: "Unter 3.5",
      pick: "Under 3.5",
    },
    {
      market: "BTTS",
      pick: "Yes",
    },
  ];

  return markets[Math.floor(Math.random() * markets.length)];
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

      if (existing) {
        continue;
      }

      const probability = 45 + Math.random() * 35;

      const marketData = randomMarket();

      await prisma.predictionSnapshot.create({
        data: {
          matchId: match.id,
          market: marketData.market,
          pick: marketData.pick,
          probability,
          confidence:
            probability >= 70
              ? "A"
              : probability >= 60
              ? "B"
              : "C",
          valueScore: Math.round(probability / 10),
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
