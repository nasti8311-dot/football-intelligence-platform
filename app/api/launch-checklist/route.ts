import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    finished,
    oddsRows,
    snapshots,
    resolved,
    correct,
    upcoming,
  ] = await Promise.all([
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
        isCorrect: { not: null },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: true,
      },
    }),
    prisma.match.count({
      where: {
        kickoff: { gte: new Date() },
      },
    }),
  ]);

  const accuracy =
    resolved > 0
      ? (correct / resolved) * 100
      : 0;

  const checks = [
    {
      key: "historical_data",
      label: "Historische Daten",
      current: finished,
      target: 1000,
      passed: finished >= 1000,
    },
    {
      key: "odds_data",
      label: "Odds Daten",
      current: oddsRows,
      target: 3000,
      passed: oddsRows >= 3000,
    },
    {
      key: "prediction_tracking",
      label: "Prediction Tracking",
      current: snapshots,
      target: 500,
      passed: snapshots >= 500,
    },
    {
      key: "resolved_predictions",
      label: "Resolved Predictions",
      current: resolved,
      target: 500,
      passed: resolved >= 500,
    },
    {
      key: "model_accuracy",
      label: "Model Accuracy",
      current: Number(accuracy.toFixed(1)),
      target: 55,
      passed: accuracy >= 55,
    },
    {
      key: "upcoming_fixtures",
      label: "Upcoming Fixtures",
      current: upcoming,
      target: 30,
      passed: upcoming >= 30,
    },
  ];

  const passed = checks.filter((c) => c.passed).length;

  return NextResponse.json({
    score: Math.round((passed / checks.length) * 100),
    passed,
    total: checks.length,
    readyForPublicBeta: passed >= 4,
    checks,
  });
}
