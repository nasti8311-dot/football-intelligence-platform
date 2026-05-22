import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const [resolved, correct, oddsRows, openPicks] = await Promise.all([
    prisma.predictionSnapshot.count({
      where: { isCorrect: { not: null } },
    }),
    prisma.predictionSnapshot.count({
      where: { isCorrect: true },
    }),
    prisma.bookmakerOdds.count(),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: null,
        match: {
          kickoff: {
            gte: now,
            lte: end,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    product: "Football IQ",
    language: "de",
    focus: "daily_picks",
    targetPicksPerDay: "3-10",
    metrics: {
      resolved,
      correct,
      accuracy: resolved ? Number(((correct / resolved) * 100).toFixed(1)) : null,
      oddsRows,
      openPicksNext3Days: openPicks,
    },
  });
}
