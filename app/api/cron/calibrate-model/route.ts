import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function bucket(market: string) {
  if (market.includes("Sieg") || market.includes("Unentschieden")) return "1X2";
  if (market.includes("2.5")) return "TOTALS";
  if (market.includes("Beide")) return "BTTS";
  return "OTHER";
}

export async function GET() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ModelCalibration" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "market" TEXT NOT NULL UNIQUE,
      "sampleSize" INTEGER NOT NULL DEFAULT 0,
      "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const snapshots: any[] = await prisma.$queryRawUnsafe(`
    SELECT *
    FROM "PredictionSnapshot"
    WHERE "isCorrect" IS NOT NULL
    ORDER BY "createdAt" DESC
    LIMIT 1000
  `);

  const groups = new Map<string, any[]>();

  for (const s of snapshots) {
    const b = bucket(String(s.market || ""));
    const list = groups.get(b) || [];
    list.push(s);
    groups.set(b, list);
  }

  const results = [];

  for (const [market, rows] of groups.entries()) {
    const sampleSize = rows.length;
    const correct = rows.filter((r) => r.isCorrect === true).length;
    const accuracy = sampleSize ? (correct / sampleSize) * 100 : 0;

    let profit = 0;
    let betsWithOdds = 0;

    for (const r of rows) {
      if (!r.oddsPrice) continue;
      betsWithOdds++;

      if (r.isCorrect === true) profit += Number(r.oddsPrice) - 1;
      else profit -= 1;
    }

    const roi = betsWithOdds ? (profit / betsWithOdds) * 100 : 0;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "ModelCalibration"
        ("market","sampleSize","accuracy","roi","profit","updatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT ("market")
       DO UPDATE SET
        "sampleSize" = EXCLUDED."sampleSize",
        "accuracy" = EXCLUDED."accuracy",
        "roi" = EXCLUDED."roi",
        "profit" = EXCLUDED."profit",
        "updatedAt" = NOW()`,
      market,
      sampleSize,
      accuracy,
      roi,
      profit
    );

    results.push({ market, sampleSize, accuracy, roi, profit });
  }

  return NextResponse.json({
    ok: true,
    calibratedAt: new Date().toISOString(),
    snapshots: snapshots.length,
    results,
  });
}
