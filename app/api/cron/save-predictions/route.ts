import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function randomBetween(min: number, max: number) {
  return Number((min + Math.random() * (max - min)).toFixed(2));
}

function choosePrediction(data: {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
}) {
  const options = [
    {
      market: "1X2",
      pick: "Home Win",
      probability: data.homeWin,
    },
    {
      market: "1X2",
      pick: "Away Win",
      probability: data.awayWin,
    },
    {
      market: "Über 2.5",
      pick: "Over 2.5",
      probability: data.over25,
    },
    {
      market: "Unter 2.5",
      pick: "Under 2.5",
      probability: data.under25,
    },
    {
      market: "BTTS",
      pick: "Yes",
      probability: data.bttsYes,
    },
    {
      market: "BTTS",
      pick: "No",
      probability: data.bttsNo,
    },
  ];

  return options.sort((a, b) => b.probability - a.probability)[0];
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
      const homeWin = randomBetween(30, 60);
      const draw = randomBetween(18, 30);
      const awayWin = randomBetween(20, 55);

      const over25 = randomBetween(45, 82);
      const under25 = Number((100 - over25).toFixed(2));

      const bttsYes = randomBetween(40, 78);
      const bttsNo = Number((100 - bttsYes).toFixed(2));

      const homeXg = randomBetween(0.8, 2.4);
      const awayXg = randomBetween(0.6, 2.1);

      const selected = choosePrediction({
        homeWin,
        draw,
        awayWin,
        over25,
        under25,
        bttsYes,
        bttsNo,
      });

      await prisma.predictionSnapshot.create({
        data: {
          matchId: match.id,

          market: selected.market,
          pick: selected.pick,
          probability: selected.probability,

          homeWin,
          draw,
          awayWin,

          over25,
          under25,

          bttsYes,
          bttsNo,

          homeXg,
          awayXg,

          confidence:
            selected.probability >= 70
              ? "A"
              : selected.probability >= 60
              ? "B"
              : "C",

          valueScore: Math.round(selected.probability / 10),
        },
      });

      saved++;
    }

    return NextResponse.json({
      ok: true,
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
