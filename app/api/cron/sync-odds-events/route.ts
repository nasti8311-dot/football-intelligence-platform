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

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing ODDS_API_KEY" }, { status: 500 });
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

        await prisma.team.upsert({
          where: { id: homeId },
          update: { name: home },
          create: {
            id: homeId,
            name: home,
            shortName: home,
            crestUrl: null,
            attack: 50,
            defense: 50,
            elo: 1500,
          },
        });

        await prisma.team.upsert({
          where: { id: awayId },
          update: { name: away },
          create: {
            id: awayId,
            name: away,
            shortName: away,
            crestUrl: null,
            attack: 50,
            defense: 50,
            elo: 1500,
          },
        });

        await prisma.league.upsert({
          where: { id: leagueId },
          update: { name: sport.replaceAll("_", " ") },
          create: { id: leagueId, name: sport.replaceAll("_", " ") },
        });

        await prisma.match.upsert({
          where: {
            source_sourceId: {
              source: "odds-api-events",
              sourceId: String(e.id),
            },
          },
          update: {
            kickoff,
            homeTeamId: homeId,
            awayTeamId: awayId,
            leagueId,
            status: "SCHEDULED",
          },
          create: {
            source: "odds-api-events",
            sourceId: String(e.id),
            kickoff,
            homeTeamId: homeId,
            awayTeamId: awayId,
            leagueId,
            status: "SCHEDULED",
          },
        });

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
