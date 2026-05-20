import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const LEAGUES = [
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
  "soccer_netherlands_eredivisie",
  "soccer_belgium_first_div",
  "soccer_greece_super_league",
  "soccer_usa_mls",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "soccer_uefa_europa_conference_league",
];

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function upsertTeam(name: string, leagueId?: string | null) {
  const id = slug(name);

  return prisma.team.upsert({
    where: { id },
    update: {
      name,
      ...(leagueId
        ? {
            league: {
              connect: { id: leagueId },
            },
          }
        : {}),
    },
    create: {
      id,
      name,
      shortName: name.slice(0, 24),
      attack: 1,
      defense: 1,
      elo: 1500,
      form: 0,
      xgFor: 1.35,
      xgAgainst: 1.35,
      possession: 50,
      pressing: 50,
      tempo: 50,
      ...(leagueId
        ? {
            league: {
              connect: { id: leagueId },
            },
          }
        : {}),
    },
  });
}

async function upsertLeague(key: string) {
  return prisma.league.upsert({
    where: {
      code: key,
    },
    update: {
      name: key.replaceAll("_", " "),
      country: "international",
    },
    create: {
      code: key,
      name: key.replaceAll("_", " "),
      country: "international",
      season: "2025/26",
    },
  });
}

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "ODDS_API_KEY fehlt" },
      { status: 500 }
    );
  }

  let saved = 0;
  let checked = 0;
  const errors: string[] = [];

  for (const leagueKey of LEAGUES) {
    try {
      const league = await upsertLeague(leagueKey);

      const url = `https://api.the-odds-api.com/v4/sports/${leagueKey}/scores/?daysFrom=3&apiKey=${apiKey}`;

      const res = await fetch(url, {
        cache: "no-store",
      });

      if (!res.ok) {
        errors.push(`${leagueKey}: ${res.status}`);
        continue;
      }

      const events = await res.json();

      for (const event of events) {
        checked++;

        if (!event.completed) continue;
        if (!event.home_team || !event.away_team) continue;

        const homeTeam = await upsertTeam(event.home_team, league.id);
        const awayTeam = await upsertTeam(event.away_team, league.id);

        const homeScore =
          event.scores?.find((s: any) => s.name === event.home_team)?.score ??
          null;

        const awayScore =
          event.scores?.find((s: any) => s.name === event.away_team)?.score ??
          null;

        if (homeScore == null || awayScore == null) continue;

        await prisma.match.upsert({
          where: {
            source_sourceId: {
              source: "odds-api-score",
              sourceId: event.id,
            },
          },
          update: {
            leagueId: league.id,
            season: "2025/26",
            kickoff: event.commence_time ? new Date(event.commence_time) : null,
            status: "FINISHED",
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            homeGoals: Number(homeScore),
            awayGoals: Number(awayScore),
          },
          create: {
            source: "odds-api-score",
            sourceId: event.id,
            leagueId: league.id,
            season: "2025/26",
            kickoff: event.commence_time ? new Date(event.commence_time) : null,
            status: "FINISHED",
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            homeGoals: Number(homeScore),
            awayGoals: Number(awayScore),
          },
        });

        saved++;
      }
    } catch (error: any) {
      errors.push(`${leagueKey}: ${error.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    checked,
    saved,
    errors,
  });
}
