import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function bucket(prob: number) {
  if (prob >= 80) return "80+";
  if (prob >= 70) return "70-79";
  if (prob >= 60) return "60-69";
  if (prob >= 50) return "50-59";
  return "<50";
}

export async function GET() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
    take: 5000,
  });

  const groups: any = {};

  for (const row of rows) {
    const b = bucket(row.probability);

    if (!groups[b]) {
      groups[b] = {
        total: 0,
        wins: 0,
      };
    }

    groups[b].total++;

    if (row.isCorrect) {
      groups[b].wins++;
    }
  }

  const output = Object.entries(groups).map(([bucket, v]: any) => ({
    bucket,
    total: v.total,
    wins: v.wins,
    accuracy:
      v.total > 0
        ? Number(((v.wins / v.total) * 100).toFixed(2))
        : 0,
  }));

  return NextResponse.json(output);
}
