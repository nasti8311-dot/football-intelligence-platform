import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ODDS_SPORT_KEYS } from "@/lib/competitions";

export const dynamic = "force-dynamic";

function slug(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function seasonFromDate(date: Date) {
  const y = date.getUTCFullYear();
  return `${y-1}/${y}`;
}

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      error: "Missing ODDS_API_KEY",
    });
  }

  const results = [];

  for (const sport of ODDS_SPORT_KEYS) {
    try {
      const res = await fetch(
        `https://api.the-odds-api.com/v4/sports/${sport}/events?apiKey=${apiKey}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        results.push({
          sport,
          error: `${res.status} ${await res.text()}`,
        });
        continue;
      }

      const events = await res.json();
      let saved = 0;

      for (const e of events || []) {
        const kickoff = new Date(e.commence_time);

        const homeId = slug(e.home_team);
        const awayId = slug(e.away_team);
        const leagueId = slug(sport);

        const season = seasonFromDate(kickoff);

        await prisma.$executeRawUnsafe(`
          INSERT INTO "Team"
          (
            "id",
            "name",
            "shortName",
            "attack",
            "defense",
            "elo",
            "form",
            "xgFor",
            "xgAgainst",
            "createdAt",
            "updatedAt"
          )
          VALUES
          (
            '${homeId}',
            '${e.home_team.replace(/'/g, "''")}',
            '${e.home_team.replace(/'/g, "''")}',
            50,
            50,
            1500,
            50,
            1.3,
            1.3,
            NOW(),
            NOW()
          )
          ON CONFLICT ("id")
          DO NOTHING
        `);

        await prisma.$executeRawUnsafe(`
          INSERT INTO "Team"
          (
            "id",
            "name",
            "shortName",
            "attack",
            "defense",
            "elo",
            "form",
            "xgFor",
            "xgAgainst",
            "createdAt",
            "updatedAt"
          )
          VALUES
          (
            '${awayId}',
            '${e.away_team.replace(/'/g, "''")}',
            '${e.away_team.replace(/'/g, "''")}',
            50,
            50,
            1500,
            50,
            1.3,
            1.3,
            NOW(),
            NOW()
          )
          ON CONFLICT ("id")
          DO NOTHING
        `);

        await prisma.$executeRawUnsafe(`
          INSERT INTO "League"
          (
            "id",
            "code",
            "name",
            "createdAt",
            "updatedAt"
          )
          VALUES
          (
            '${leagueId}',
            '${sport}',
            '${sport.replaceAll("_", " ")}',
            NOW(),
            NOW()
          )
          ON CONFLICT ("id")
          DO NOTHING
        `);

        await prisma.$executeRawUnsafe(`
          INSERT INTO "Match"
          (
            "id",
            "leagueId",
            "season",
            "matchday",
            "kickoff",
            "status",
            "homeTeamId",
            "awayTeamId",
            "homeGoals",
            "awayGoals",
            "source",
            "sourceId",
            "createdAt",
            "updatedAt"
          )
          VALUES
          (
            gen_random_uuid()::text,
            '${leagueId}',
            '${season}',
            0,
            '${kickoff.toISOString()}',
            'SCHEDULED',
            '${homeId}',
            '${awayId}',
            0,
            0,
            'odds-api-events',
            '${e.id}',
            NOW(),
            NOW()
          )
          ON CONFLICT ("source","sourceId")
          DO NOTHING
        `);

        saved++;
      }

      results.push({
        sport,
        apiEvents: events.length,
        saved,
      });
    } catch (e: any) {
      results.push({
        sport,
        error: e?.message || "Unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    results,
  });
}
