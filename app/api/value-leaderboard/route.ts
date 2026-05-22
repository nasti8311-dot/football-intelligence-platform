import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      edge: {
        not: null,
      },
    },
    orderBy: {
      edge: "desc",
    },
    take: 50,
  });

  return NextResponse.json({
    total: rows.length,
    topEdges: rows.map((r) => ({
      market: r.market,
      pick: r.pick,
      edge: r.edge,
      probability: r.probability,
      odds: r.oddsPrice,
      confidence: r.confidence,
      result: r.result,
      isCorrect: r.isCorrect,
    })),
  });
}
