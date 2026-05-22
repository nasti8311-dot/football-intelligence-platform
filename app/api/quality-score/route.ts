import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [finished, oddsRows, snapshots, resolved, correct, upcoming] =
    await Promise.all([
      prisma.match.count({ where: { homeGoals: { not: null }, awayGoals: { not: null } } }),
      prisma.bookmakerOdds.count(),
      prisma.predictionSnapshot.count(),
      prisma.predictionSnapshot.count({ where: { isCorrect: { not: null } } }),
      prisma.predictionSnapshot.count({ where: { isCorrect: true } }),
      prisma.match.count({ where: { kickoff: { gte: new Date() } } }),
    ]);

  const accuracy = resolved ? (correct / resolved) * 100 : 0;

  const dataScore = Math.min(100, Math.round((finished / 1000) * 50 + (oddsRows / 3000) * 50));
  const modelScore = Math.min(100, Math.round((resolved / 1000) * 50 + Math.max(0, accuracy - 45) * 5));
  const opsScore = Math.min(100, Math.round((upcoming / 30) * 100));

  return NextResponse.json({
    overall: Math.round((dataScore + modelScore + opsScore) / 3),
    dataScore,
    modelScore,
    opsScore,
    metrics: {
      finished,
      oddsRows,
      snapshots,
      resolved,
      correct,
      accuracy: Number(accuracy.toFixed(2)),
      upcoming,
    },
  });
}
