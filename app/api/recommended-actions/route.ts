import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    upcoming,
    finished,
    oddsRows,
    resolved,
    correct,
  ] = await Promise.all([
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
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: { not: null },
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
      ? (correct / resolved) * 100
      : 0;

  const actions = [];

  if (oddsRows < 3000) {
    actions.push({
      priority: "HIGH",
      title: "Odds Coverage verbessern",
      reason: "Zu wenige aktuelle Marktquoten begrenzen Verified Picks.",
    });
  }

  if (finished < 1000) {
    actions.push({
      priority: "HIGH",
      title: "Mehr historische Spiele laden",
      reason: "Mehr Historie stabilisiert ELO, xG und Calibration.",
    });
  }

  if (resolved < 1000) {
    actions.push({
      priority: "MEDIUM",
      title: "Mehr Predictions tracken",
      reason: "Calibration braucht mehr resolved Snapshots.",
    });
  }

  if (accuracy < 55) {
    actions.push({
      priority: "MEDIUM",
      title: "Pick Selector strenger kalibrieren",
      reason: "Accuracy liegt unter Zielwert.",
    });
  }

  if (upcoming < 30) {
    actions.push({
      priority: "LOW",
      title: "Fixture Coverage prüfen",
      reason: "Wenige kommende Spiele verfügbar.",
    });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    actions,
  });
}
