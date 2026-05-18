import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      ps.id,
      ps.market,
      ps.pick,
      m.id as "matchId",
      m.source,
      m."sourceId",
      m."homeTeamId",
      m."awayTeamId",
      m."homeGoals",
      m."awayGoals",
      m.status,
      m.kickoff
    FROM "PredictionSnapshot" ps
    JOIN "Match" m ON m.id = ps."matchId"
    WHERE ps."isCorrect" IS NULL
    ORDER BY m.kickoff ASC
    LIMIT 30
  `);

  return NextResponse.json({
    ok: true,
    count: rows.length,
    rows,
  });
}
