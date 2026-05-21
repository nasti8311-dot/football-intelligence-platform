import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const resolved = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
  });

  const total = resolved.length;
  const correct = resolved.filter((p) => p.isCorrect).length;

  const byMarket = new Map<string, { total: number; correct: number }>();

  for (const p of resolved) {
    const current = byMarket.get(p.market) || { total: 0, correct: 0 };

    current.total += 1;
    if (p.isCorrect) current.correct += 1;

    byMarket.set(p.market, current);
  }

  return NextResponse.json({
    totalResolved: total,
    correct,
    accuracy: total > 0 ? Number(((correct / total) * 100).toFixed(2)) : null,
    byMarket: Array.from(byMarket.entries()).map(([market, stats]) => ({
      market,
      total: stats.total,
      correct: stats.correct,
      accuracy:
        stats.total > 0
          ? Number(((stats.correct / stats.total) * 100).toFixed(2))
          : null,
    })),
  });
}
