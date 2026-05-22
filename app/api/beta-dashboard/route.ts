import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const [matches, picks, resolved, correct, oddsRows] = await Promise.all([
    prisma.match.count({
      where: {
        kickoff: {
          gte: now,
          lte: in3Days,
        },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: null,
        match: {
          kickoff: {
            gte: now,
            lte: in3Days,
          },
        },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: {
          not: null,
        },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: true,
      },
    }),
    prisma.bookmakerOdds.count(),
  ]);

  return NextResponse.json({
    matchesNext3Days: matches,
    openPredictions: picks,
    resolvedPredictions: resolved,
    accuracy: resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : null,
    oddsRows,
    betaReady: resolved >= 300 && oddsRows >= 1000,
  });
}
