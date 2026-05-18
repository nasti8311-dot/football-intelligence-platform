import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPredictions } from "@/lib/predictions";
import { premiumAdjustPredictions } from "@/lib/premium-model";
import { advancedTune } from "@/lib/advanced-tuning";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 80), 300);
  const rows = await prisma.match.findMany({
    take: 3000,
    orderBy: { kickoff: "asc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      bookmakerOdds: true,
    },
  });

  const allMatches = rows.map((m) => ({
    id: m.id,
    kickoff: m.kickoff,
    league: m.league?.name ?? "League",
    home: m.homeTeam?.name || m.homeTeamId,
    away: m.awayTeam?.name || m.awayTeamId,
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    odds: (m as any).bookmakerOdds || [],
    news: [],
  }));

  const finished = allMatches
    .filter((m) => m.kickoff && m.homeGoals !== null && m.awayGoals !== null)
    .slice(-limit);

  const calibrationRows = (await prisma.$queryRawUnsafe(`
    SELECT "market","sampleSize","accuracy","roi"
    FROM "ModelCalibration"
  `).catch(() => [])) as any[];

  const leagueRows = (await prisma.$queryRawUnsafe(`
    SELECT "league","sampleSize","accuracy","roi"
    FROM "LeagueCalibration"
  `).catch(() => [])) as any[];

  let created = 0;
  let skipped = 0;
  const debug = [];

  for (const target of finished) {
    if (!target.kickoff) continue;

    const existing = (await prisma.$queryRawUnsafe(
      `SELECT id FROM "PredictionSnapshot"
       WHERE "matchId" = $1
       AND "createdAt" < $2
       LIMIT 1`,
      target.id,
      target.kickoff
    ).catch(() => [])) as any[];

    if (existing.length) {
      skipped++;
      continue;
    }

    const cutoff = new Date(new Date(target.kickoff).getTime() - 1000 * 60 * 60 * 2);

    const trainingMatches = allMatches.map((m) => {
      const isAfterCutoff = m.kickoff && new Date(m.kickoff) >= cutoff;

      return {
        ...m,
        homeGoals: isAfterCutoff ? null : m.homeGoals,
        awayGoals: isAfterCutoff ? null : m.awayGoals,
      };
    });

    const predictions = advancedTune(
      premiumAdjustPredictions(buildPredictions(trainingMatches as any, cutoff), calibrationRows),
      calibrationRows,
      leagueRows
    );

    const p = predictions.find((x: any) => x.id === target.id);
    if (!p) {
      skipped++;
      continue;
    }

    const ok = evaluate(p.bestMarket, Number(target.homeGoals), Number(target.awayGoals));
    if (ok === null) {
      skipped++;
      continue;
    }

    try {
      await prisma.$executeRawUnsafe(
      `INSERT INTO "PredictionSnapshot"
        ("id","matchId","market","pick","probability","homeWin","draw","awayWin",
         "over25","under25","bttsYes","bttsNo","homeXg","awayXg","confidence",
         "valueScore","oddsPrice","impliedProb","edge","injuryPenalty","summary",
         "result","isCorrect","createdAt","updatedAt")
       VALUES
        (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
         $15,$16,$17,$18,$19,$20,$21,$22,NOW(),NOW())
       ON CONFLICT DO NOTHING`,
      p.id,
      p.bestMarket,
      p.bestPick,
      p.bestProbability,
      p.homeWin,
      p.draw,
      p.awayWin,
      p.over25,
      p.under25,
      p.bttsYes,
      p.bttsNo,
      p.homeXg,
      p.awayXg,
      p.confidence,
      p.valueScore,
      (p as any).marketOdds || null,
      (p as any).impliedProbability || null,
      (p as any).edge || null,
      (p as any).injuryPenalty || null,
      (p as any).summary || null,
      `${target.homeGoals}:${target.awayGoals}`,
      ok
    );

      created++;
    } catch (e: any) {
      skipped++;
      if (debug.length < 12) {
        debug.push({
          match: `${target.home} vs ${target.away}`,
          error: e?.message || "insert failed",
        });
      }
      continue;
    }

    if (debug.length < 12) {
      debug.push({
        match: `${target.home} vs ${target.away}`,
        market: p.bestMarket,
        probability: Math.round(p.bestProbability),
        result: `${target.homeGoals}:${target.awayGoals}`,
        correct: ok,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    backtestedAt: new Date().toISOString(),
    scanned: finished.length,
    created,
    skipped,
    debug,
  });
}
