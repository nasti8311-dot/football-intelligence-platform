import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    matches,
    upcoming,
    finished,
    oddsRows,
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

  return NextResponse.json({
    platform: "Football IQ",
    version: "0.8 MVP Quant Platform",
    status: "BUILDING_PUBLIC_BETA",
    summary: {
      matches,
      upcoming,
      finished,
      oddsRows,
      snapshots,
      resolved,
      correct,
      accuracy,
    },
    modules: {
      dataPipeline: true,
      oddsIntegration: true,
      eloEngine: true,
      xgEngine: true,
      calibration: true,
      verifiedPicks: true,
      resolver: true,
      trackRecord: true,
      quantDashboards: true,
    },
    nextPriorities: [
      "Improve odds coverage",
      "Improve xG model quality",
      "Add closing line tracking",
      "Add ROI and CLV analytics",
      "Polish public UX",
    ],
  });
}
