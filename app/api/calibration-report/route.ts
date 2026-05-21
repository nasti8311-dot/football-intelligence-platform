import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalize(probability: number) {
  return probability > 1
    ? probability / 100
    : probability;
}

function bucket(probability: number) {
  return Math.floor(probability * 10) / 10;
}

function bayesianAccuracy(
  correct: number,
  total: number,
  prior = 0.55,
  strength = 12
) {
  return (
    (correct + prior * strength) /
    (total + strength)
  );
}

export async function GET() {
  const rows =
    await prisma.predictionSnapshot.findMany({
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

  const map = new Map<
    string,
    {
      market: string;
      bucket: number;
      total: number;
      correct: number;
    }
  >();

  for (const row of rows) {
    const normalized =
      normalize(Number(row.probability));

    const b = bucket(normalized);

    const key =
      `${row.market}:${b}`;

    const current =
      map.get(key) || {
        market: row.market,
        bucket: b,
        total: 0,
        correct: 0,
      };

    current.total += 1;

    if (row.isCorrect) {
      current.correct += 1;
    }

    map.set(key, current);
  }

  const buckets =
    Array.from(map.values())
      .map((item) => {
        const actual =
          bayesianAccuracy(
            item.correct,
            item.total
          );

        return {
          market: item.market,

          bucket:
            Number(
              (item.bucket * 100).toFixed(0)
            ),

          total: item.total,

          rawAccuracy:
            Number(
              (
                (item.correct / item.total) *
                100
              ).toFixed(2)
            ),

          smoothedAccuracy:
            Number(
              (actual * 100).toFixed(2)
            ),
        };
      })
      .sort(
        (a, b) =>
          a.market.localeCompare(b.market) ||
          a.bucket - b.bucket
      );

  return NextResponse.json({
    total: rows.length,
    buckets,
  });
}
