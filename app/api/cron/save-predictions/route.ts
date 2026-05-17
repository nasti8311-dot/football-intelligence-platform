import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPredictions } from "@/lib/predictions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function GET() {
  const today = dateKey(new Date());

  const rows = await prisma.match.findMany({
    take: 2500,
    orderBy: { kickoff: "asc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      bookmakerOdds: true,
    },
  });

  const matches = rows.map((m) => ({
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

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const predictions = buildPredictions(matches, dayStart)
    .filter((p) => p.kickoff && dateKey(new Date(p.kickoff)) === today)
    .sort((a, b) => {
      if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
      return b.bestProbability - a.bestProbability;
    })
    .slice(0, 10);

  let saved = 0;

  for (const p of predictions) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "PredictionSnapshot"
        ("id","matchId","market","pick","probability","homeWin","draw","awayWin","over25","under25","bttsYes","bttsNo","homeXg","awayXg","confidence","valueScore","createdAt","updatedAt")
       VALUES
        (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW())`,
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
      p.valueScore
    );

    saved++;
  }

  return NextResponse.json({
    ok: true,
    date: today,
    saved,
  });
}
