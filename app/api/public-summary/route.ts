import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalSnapshots,
    resolved,
    correct,
    verifiedUpcoming,
    upcoming,
    oddsRows,
  ] = await Promise.all([
    prisma.predictionSnapshot.count(),
    prisma.predictionSnapshot.count({
      where: { isCorrect: { not: null } },
    }),
    prisma.predictionSnapshot.count({
      where: { isCorrect: true },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: null,
        edge: { gt: 0.04 },
      },
    }),
    prisma.match.count({
      where: {
        kickoff: { gte: new Date() },
      },
    }),
    prisma.bookmakerOdds.count(),
  ]);

  return NextResponse.json({
    product: "Football IQ",
    status: "MVP Quant Platform",
    metrics: {
      totalSnapshots,
      resolved,
      correct,
      accuracy:
        resolved > 0
          ? Number(((correct / resolved) * 100).toFixed(2))
          : null,
      verifiedUpcoming,
      upcoming,
      oddsRows,
    },
    principles: [
      "Keine Fake-Predictions",
      "Verified Picks nur bei ausreichender Datenlage",
      "Historische Performance wird öffentlich messbar",
      "Calibration statt künstlicher Confidence",
      "Marktquoten werden als Datenquelle berücksichtigt",
    ],
  });
}
