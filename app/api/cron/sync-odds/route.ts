import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const sports = ["soccer_epl"];

function key(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|afc|sc|sv|club|football|munchen|muenchen/g, "")
    .replace(/manchester-city/g, "city")
    .replace(/manchester city/g, "city")
    .replace(/tottenham-hotspur/g, "tottenham")
    .replace(/tottenham hotspur/g, "tottenham")
    .replace(/nottingham-forest/g, "nottingham")
    .replace(/nottingham forest/g, "nottingham")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function implied(price: number) {
  return price > 0 ? 1 / price : 0;
}

async function syncSport(sport: string) {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ODDS_API_KEY");
  }

  const now = new Date();
  const to = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const dbMatches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
        lte: to,
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  const url =
    `https://api.the-odds-api.com/v4/sports/${sport}/odds` +
    `?apiKey=${apiKey}` +
    `&regions=eu` +
    `&markets=h2h,totals` +
    `&oddsFormat=decimal` +
    `&dateFormat=iso`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  const res = await fetch(url, {
    cache: "no-store",
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${sport}: ${res.status} ${text}`);
  }

  const games = await res.json();

  let matched = 0;
  let saved = 0;

  const debug: any[] = [];

  for (const game of games.slice(0, 10)) {
    const oddsHome = key(game.home_team);
    const oddsAway = key(game.away_team);
    const oddsTime = new Date(game.commence_time).getTime();

    const match = dbMatches.find((m) => {
      const dbHome = key(m.homeTeam?.name || m.homeTeamId);
      const dbAway = key(m.awayTeam?.name || m.awayTeamId);
      const dbTime = m.kickoff ? new Date(m.kickoff).getTime() : 0;

      const sameTeams =
        dbHome === oddsHome &&
        dbAway === oddsAway;

      const timeClose =
        Math.abs(dbTime - oddsTime) < 1000 * 60 * 60 * 30;

      return sameTeams && timeClose;
    });

    if (debug.length < 8) {
      debug.push({
        oddsHome: game.home_team,
        oddsAway: game.away_team,
        commence: game.commence_time,
        matched: !!match,
      });
    }

    if (!match) continue;

    matched++;

    for (const bm of (game.bookmakers || []).slice(0, 1)) {
      for (const market of bm.markets || []) {
        for (const outcome of market.outcomes || []) {
          if (!outcome.price) continue;

          const outcomeName =
            market.key === "h2h"
              ? outcome.name
              : `${outcome.name} ${outcome.point ?? ""}`.trim();

          await prisma.bookmakerOdds.upsert({
            where: {
              matchId_bookmaker_market_outcome: {
                matchId: match.id,
                bookmaker: bm.title || bm.key,
                market: market.key,
                outcome: outcomeName,
              },
            },
            update: {
              price: Number(outcome.price),
              impliedProb: implied(Number(outcome.price)),
              source: "the-odds-api",
            },
            create: {
              matchId: match.id,
              bookmaker: bm.title || bm.key,
              market: market.key,
              outcome: outcomeName,
              price: Number(outcome.price),
              impliedProb: implied(Number(outcome.price)),
              source: "the-odds-api",
            },
          });

          saved++;
        }
      }
    }
  }

  return {
    sport,
    apiGames: games.length,
    dbMatches: dbMatches.length,
    matched,
    saved,
    debug,
  };
}

export async function GET() {
  const results = [];

  for (const sport of sports) {
    try {
      results.push(await syncSport(sport));
    } catch (e: any) {
      results.push({
        sport,
        error: e?.name === "AbortError" ? "Odds API timeout" : e?.message || "Unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    results,
  });
}
