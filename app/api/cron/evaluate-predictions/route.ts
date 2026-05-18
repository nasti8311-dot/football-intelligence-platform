import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function evaluate(market: string, homeGoals: number, awayGoals: number) {
  if (market === "Sieg Heim") return homeGoals > awayGoals;
  if (market === "Sieg Auswärts") return awayGoals > homeGoals;
  if (market === "Unentschieden") return homeGoals === awayGoals;
  if (market === "Über 2.5 Tore") return homeGoals + awayGoals >= 3;
  if (market === "Unter 2.5 Tore") return homeGoals + awayGoals < 3;
  if (market === "Beide treffen") return homeGoals > 0 && awayGoals > 0;
  if (market === "Beide treffen nicht") return homeGoals === 0 || awayGoals === 0;
  return null;
}

export async function GET() {
  const snapshots: any[] = await prisma.$queryRawUnsafe(`
    SELECT
      ps.id,
      ps.market,
      ps."isCorrect",
      m."homeGoals",
      m."awayGoals"
    FROM "PredictionSnapshot" ps
    JOIN "Match" m ON m.id = ps."matchId"
    WHERE (ps."isCorrect" IS NULL)
      AND m."homeGoals" IS NOT NULL
      AND m."awayGoals" IS NOT NULL
  `);

  let evaluated = 0;
  const debug = [];

  for (const s of snapshots) {
    const homeGoals = Number(s.homeGoals);
    const awayGoals = Number(s.awayGoals);
    const ok = evaluate(String(s.market), homeGoals, awayGoals);

    if (ok === null) continue;

    await prisma.$executeRawUnsafe(
      `UPDATE "PredictionSnapshot"
       SET "isCorrect" = $1,
           "result" = $2,
           "updatedAt" = NOW()
       WHERE "id" = $3`,
      ok,
      `${homeGoals}:${awayGoals}`,
      s.id
    );

    evaluated++;

    if (debug.length < 10) {
      debug.push({
        id: s.id,
        market: s.market,
        result: `${homeGoals}:${awayGoals}`,
        correct: ok,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    found: snapshots.length,
    evaluated,
    debug,
  });
}
