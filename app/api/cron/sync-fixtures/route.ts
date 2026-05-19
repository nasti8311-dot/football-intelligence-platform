import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FOOTBALL_DATA_COMPETITIONS } from "@/lib/competitions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const competitions = ["BL1"];

function slug(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function upsertTeam(name: string) {
  const id = slug(name);

  return prisma.team.upsert({
    where: { id },
    update: { name, shortName: name },
    create: {
      id,
      name,
      shortName: name,
      attack: 50,
      defense: 50,
      elo: 1500,
      form: 0,
      xgFor: 0,
      xgAgainst: 0,
    },
  });
}

async function syncCompetition(code: string) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing FOOTBALL_DATA_API_KEY");
  }

  const url = `https://api.football-data.org/v4/competitions/${code}/matches?status=SCHEDULED`;

  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": apiKey,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${code} failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const matches = data.matches || [];

  let imported = 0;

  for (const m of matches) {
    const home = m.homeTeam?.name;
    const away = m.awayTeam?.name;

    if (!home || !away || !m.utcDate) continue;

    const league = await prisma.league.upsert({
      where: { code },
      update: {
        name: m.competition?.name || code,
        country: m.area?.name || "Unknown",
      },
      create: {
        code,
        name: m.competition?.name || code,
        country: m.area?.name || "Unknown",
      },
    });

    const homeTeam = await upsertTeam(home);
    const awayTeam = await upsertTeam(away);

    const sourceId = String(m.id);

    await prisma.match.upsert({
      where: {
        source_sourceId: {
          source: "football-data-api",
          sourceId,
        },
      },
      update: {
        kickoff: new Date(m.utcDate),
        status: "SCHEDULED",
        homeGoals: null,
        awayGoals: null,
      },
      create: {
        leagueId: league.id,
        season: "2026/27",
        kickoff: new Date(m.utcDate),
        status: "SCHEDULED",
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeGoals: null,
        awayGoals: null,
        source: "football-data-api",
        sourceId,
      },
    });

    imported++;
  }

  return { code, imported };
}

export async function GET() {
  const results = [];

  for (const code of competitions) {
    try {
      results.push(await syncCompetition(code));
    } catch (error: any) {
      results.push({
        code,
        error: error?.message || "Unknown error",
      });
    }
  }

  const upcoming = await prisma.match.count({
    where: {
      kickoff: { gt: new Date() },
    },
  });

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    results,
    upcoming,
  });
}
