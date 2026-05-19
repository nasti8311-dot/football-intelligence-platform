import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ODDS_SPORT_KEYS } from "@/lib/competitions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function slug(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function seasonFromDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Missing ODDS_API_KEY" },
      { status: 500 }
    );
  }

  const results = [];

  for (const sport of ODDS_SPORT_KEYS) {
    try {
      const res = await fetch(
        `https://api.the-odds-api.com/v4/sports/${sport}/events?apiKey=${apiKey}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        results.push({ sport, error: `${res.status} ${await res.text()}` });
        continue;
      }

      const events = await res.json();
      let saved = 0;

      for (const e of events || []) {
        const home = e.home_team;
        const away = e.away_team;
        const kickoff = e.commence_time ? new Date(e.commence_time) : null;

        if (!home || !away || !kickoff) continue;

        const homeId = slug(home);
        const awayId = slug(away);
        const leagueId = slug(sport);
        const leagueName = sport.replaceAll("_", " ");
        const season = seasonFromDate(kickoff);

        await prisma.$executeRawUnsafe(
          `INSERT INTO "Team"
            ("id","name","shortName","country","attack","defense","elo","form","xgFor","xgAgainst")
           VALUES
            ($1,$2,$3,'Unknown',50,50,1500,50,1.3,1.3)
           ON CONFLICT ("id")
           DO UPDATE SET
            "name" = EXCLUDED."name",
            "shortName" = EXCLUDED."shortName"`,
          homeId,
          home,
          home
        );

        await prisma.$executeRawUnsafe(
          `INSERT INTO "Team"
            ("id","name","shortName","country","attack","defense","elo","form","xgFor","xgAgainst")
           VALUES
            ($1,$2,$3,'Unknown',50,50,1500,50,1.3,1.3)
           ON CONFLICT ("id")
           DO UPDATE SET
            "name" = EXCLUDED."name",
            "shortName" = EXCLUDED."shortName"`,
          awayId,
          away,
          away
        );

        await prisma.$executeRawUnsafe(
          `INSERT INTO "League"
            ("id","name","code")
           VALUES
            ($1,$2,$3)
           ON CONFLICT ("id")
           DO UPDATE SET
            "name" = EXCLUDED."name",
            "code" = EXCLUDED."code"`,
          leagueId,
          leagueName,
          sport
        );

        await prisma.$executeRawUnsafe(
          `INSERT INTO "Match"
            ("id","source","sourceId","kickoff","homeTeamId","awayTeamId","leagueId","status","season")
           VALUES
            (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT ("source","sourceId")
           DO UPDATE SET
            "kickoff" = EXCLUDED."kickoff",
            "homeTeamId" = EXCLUDED."homeTeamId",
            "awayTeamId" = EXCLUDED."awayTeamId",
            "leagueId" = EXCLUDED."leagueId",
            "status" = EXCLUDED."status",
            "season" = EXCLUDED."season"`,
          "odds-api-events",
          String(e.id),
          kickoff,
          homeId,
          awayId,
          leagueId,
          "SCHEDULED",
          season
        );

        saved++;
      }

      results.push({ sport, apiEvents: events?.length || 0, saved });
    } catch (e: any) {
      results.push({ sport, error: e?.message || "Unknown error" });
    }
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    results,
  });
}
