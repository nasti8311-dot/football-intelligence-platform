import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ODDS_SPORT_KEYS } from "@/lib/competitions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const sports = ODDS_SPORT_KEYS;

function key(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|afc|sc|sv|club|football|de|the)\b/g, "")
    .replace(/munchen|muenchen/g, "munich")
    .replace(/internazionale/g, "inter")
    .replace(/athletic club/g, "athletic bilbao")
    .replace(/real sociedad de futbol/g, "real sociedad")
    .replace(/rcd espanyol de barcelona/g, "espanyol")
    .replace(/ca osasuna/g, "osasuna")
    .replace(/rc celta de vigo/g, "celta vigo")
    .replace(/deportivo alaves/g, "alaves")
    .replace(/real betis balompie/g, "real betis")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function tokens(name: string) {
  return key(name).split("-").filter(Boolean);
}

function similarity(a: string, b: string) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));

  if (!ta.size || !tb.size) return 0;

  let overlap = 0;

  for (const t of ta) {
    if (tb.has(t)) overlap++;
  }

  return overlap / Math.max(ta.size, tb.size);
}

function implied(price: number) {
  return price > 0 ? 1 / price : 0;
}

function matchScore(dbMatch: any, game: any) {
  const dbHome = dbMatch.homeTeam?.name || dbMatch.homeTeamId;
  const dbAway = dbMatch.awayTeam?.name || dbMatch.awayTeamId;

  const direct =
    key(dbHome) === key(game.home_team) &&
    key(dbAway) === key(game.away_team);

  const swapped =
    key(dbHome) === key(game.away_team) &&
    key(dbAway) === key(game.home_team);

  const homeSim = similarity(dbHome, game.home_team);
  const awaySim = similarity(dbAway, game.away_team);

  const swappedHomeSim = similarity(dbHome, game.away_team);
  const swappedAwaySim = similarity(dbAway, game.home_team);

  const normalScore =
    direct ? 1 : (homeSim + awaySim) / 2;

  const swappedScore =
    swapped ? 1 : (swappedHomeSim + swappedAwaySim) / 2;

  return Math.max(normalScore, swappedScore);
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
      league: true,
    },
    take: 800,
  });

  const url =
    `https://api.the-odds-api.com/v4/sports/${sport}/odds` +
    `?apiKey=${apiKey}` +
    `&regions=eu,uk,us` +
    `&markets=h2h` +
    `&oddsFormat=decimal` +
    `&dateFormat=iso`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

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

  for (const game of games) {
    const oddsTime = new Date(game.commence_time).getTime();

    const candidates = dbMatches
      .map((m) => {
        const dbTime = m.kickoff ? new Date(m.kickoff).getTime() : 0;
        const hours = Math.abs(dbTime - oddsTime) / (1000 * 60 * 60);

        return {
          match: m,
          score: matchScore(m, game),
          hours,
        };
      })
      .filter((c) => c.hours <= 72)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.hours - b.hours;
      });

    const best = candidates[0];

    if (debug.length < 12) {
      debug.push({
        sport,
        oddsHome: game.home_team,
        oddsAway: game.away_team,
        commence: game.commence_time,
        matched: Boolean(best && best.score >= 0.55),
        bestScore: best?.score ?? 0,
        bestHours: best?.hours ?? null,
        dbHome: best?.match?.homeTeam?.name,
        dbAway: best?.match?.awayTeam?.name,
      });
    }

    if (!best || best.score < 0.55) continue;

    const match = best.match;

    matched++;

    for (const bm of game.bookmakers || []) {
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
        error:
          e?.name === "AbortError"
            ? "Odds API timeout"
            : e?.message || "Unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    results,
  });
}
