import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LeagueCalibration" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "league" TEXT NOT NULL UNIQUE,
      "sampleSize" INTEGER NOT NULL DEFAULT 0,
      "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      ps.*,
      COALESCE(l.name, 'Unknown') as league
    FROM "PredictionSnapshot" ps
    JOIN "Match" m ON m.id = ps."matchId"
    LEFT JOIN "League" l ON l.id = m."leagueId"
    WHERE ps."isCorrect" IS NOT NULL
    ORDER BY ps."createdAt" DESC
    LIMIT 1500
  `);

  const groups = new Map<string, any[]>();

  for (const row of rows) {
    const league = String(row.league || "Unknown");
    const list = groups.get(league) || [];
    list.push(row);
    groups.set(league, list);
  }

  const results = [];

  for (const [league, items] of groups.entries()) {
    const sampleSize = items.length;
    const correct = items.filter((x) => x.isCorrect === true).length;
    const accuracy = sampleSize ? (correct / sampleSize) * 100 : 0;

    let profit = 0;
    let oddsCount = 0;

    for (const x of items) {
      if (!x.oddsPrice) continue;
      oddsCount++;
      profit += x.isCorrect === true ? Number(x.oddsPrice) - 1 : -1;
    }

    const roi = oddsCount ? (profit / oddsCount) * 100 : 0;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "LeagueCalibration"
        ("league","sampleSize","accuracy","roi","profit","updatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW())
       ON CONFLICT ("league")
       DO UPDATE SET
        "sampleSize" = EXCLUDED."sampleSize",
        "accuracy" = EXCLUDED."accuracy",
        "roi" = EXCLUDED."roi",
        "profit" = EXCLUDED."profit",
        "updatedAt" = NOW()`,
      league,
      sampleSize,
      accuracy,
      roi,
      profit
    );

    results.push({ league, sampleSize, accuracy, roi, profit });
  }

  return NextResponse.json({
    ok: true,
    calibratedAt: new Date().toISOString(),
    results,
  });
}
