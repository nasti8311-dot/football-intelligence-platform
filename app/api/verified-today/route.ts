import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const snapshots = await prisma.predictionSnapshot.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
      isCorrect: null,
    },
    orderBy: {
      valueScore: "desc",
    },
    take: 50,
  });

  return NextResponse.json({
    date: start.toISOString().slice(0, 10),
    total: snapshots.length,
    picks: snapshots.map((p) => ({
      market: p.market,
      pick: p.pick,
      probability: p.probability,
      confidence: p.confidence,
      valueScore: p.valueScore,
      edge: p.edge,
    })),
  });
}
