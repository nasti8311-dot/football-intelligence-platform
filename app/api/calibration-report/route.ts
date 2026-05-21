import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function bucket(probability: number) {
  return Math.floor(probability * 10) / 10;
}

export async function GET() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
    select: {
      market: true,
      probability: true,
      isCorrect: true,
    },
  });

  const map = new Map<string, { market: string; bucket: number; total: number; correct: number }>();

  for (const row of rows) {
    const b = bucket(Number(row.probability));
    const key = `${row.market}:${b}`;

    const current =
      map.get(key) || {
        market: row.market,
        bucket: b,
        total: 0,
        correct: 0,
      };

    current.total += 1;
    if (row.isCorrect) current.correct += 1;

    map.set(key, current);
  }

  return NextResponse.json({
    total: rows.length,
    buckets: Array.from(map.values())
      .map((item) => ({
        ...item,
        predicted: Number((item.bucket * 100).toFixed(0)),
        actual: Number(((item.correct / item.total) * 100).toFixed(2)),
      }))
      .sort((a, b) => a.market.localeCompare(b.market) || a.bucket - b.bucket),
  });
}
