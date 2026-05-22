import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();

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
    prisma.match.count({ where: { kickoff: { gte: now } } }),
    prisma.match.count({ where: { homeGoals: { not: null }, awayGoals: { not: null } } }),
    prisma.bookmakerOdds.count(),
    prisma.predictionSnapshot.count(),
    prisma.predictionSnapshot.count({ where: { isCorrect: { not: null } } }),
    prisma.predictionSnapshot.count({ where: { isCorrect: true } }),
  ]);

  return NextResponse.json({
    ok: true,
    status: "ONLINE",
    checkedAt: new Date().toISOString(),
    metrics: {
      matches,
      upcoming,
      finished,
      oddsRows,
      snapshots,
      resolved,
      correct,
      accuracy: resolved > 0 ? Number(((correct / resolved) * 100).toFixed(2)) : null,
    },
  });
}
