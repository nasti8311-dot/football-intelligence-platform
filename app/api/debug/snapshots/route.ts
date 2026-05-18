import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      ps.id,
      ps."matchId",
      ps.market,
      ps.pick,
      ps."isCorrect",
      m."homeTeamId",
      m."awayTeamId",
      m."homeGoals",
      m."awayGoals",
      m.status,
      m.kickoff
    FROM "PredictionSnapshot" ps
    JOIN "Match" m ON m.id = ps."matchId"
    ORDER BY ps."createdAt" DESC
    LIMIT 20
  `);

  return NextResponse.json({
    ok: true,
    count: rows.length,
    rows,
  });
}
