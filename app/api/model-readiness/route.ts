import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    matches,
    upcoming,
    finished,
    odds,
    snapshots,
    resolved,
    correct,
  ] = await Promise.all([
    prisma.match.count(),
    prisma.match.count({
      where: {
        kickoff: {
          gte: new Date(),
        },
      },
    }),
    prisma.match.count({
      where: {
        homeGoals: { not: null },
        awayGoals: { not: null },
      },
    }),
    prisma.bookmakerOdds.count(),
    prisma.predictionSnapshot.count(),
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
  ]);

  const accuracy =
    resolved > 0
      ? Number(((correct / resolved) * 100).toFixed(2))
      : null;

  const score =
    Math.min(100, Math.round(
      (finished >= 1000 ? 25 : (finished / 1000) * 25) +
      (odds >= 3000 ? 20 : (odds / 3000) * 20) +
      (resolved >= 1000 ? 25 : (resolved / 1000) * 25) +
      (upcoming >= 30 ? 15 : (upcoming / 30) * 15) +
      (accuracy && accuracy >= 55 ? 15 : 5)
    ));

  return NextResponse.json({
    score,
    status:
      score >= 80
        ? "PUBLIC_READY"
        : score >= 60
          ? "BETA_READY"
          : "BUILDING",
    metrics: {
      matches,
      upcoming,
      finished,
      odds,
      snapshots,
      resolved,
      correct,
      accuracy,
    },
    nextActions: [
      finished < 1000 ? "Mehr historische Spiele laden" : null,
      odds < 3000 ? "Odds Coverage verbessern" : null,
      resolved < 1000 ? "Mehr Predictions tracken und resolven" : null,
      upcoming < 30 ? "Upcoming Fixtures prüfen" : null,
    ].filter(Boolean),
  });
}
