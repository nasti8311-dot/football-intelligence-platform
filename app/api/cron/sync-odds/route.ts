import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const sports = [
  "soccer_germany_bundesliga",
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_france_ligue_one",
];

function key(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|afc|sc|sv|club|football|munchen|muenchen/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function implied(price: number) {
  return price > 0 ? 1 / price : 0;
}

async function findMatch(home: string, away: string, commence: string) {
  const h = key(home);
  const a = key(away);
  const date = new Date(commence);
  const from = new Date(date.getTime() - 1000 * 60 * 60 * 18);
  const to = new Date(date.getTime() + 1000 * 60 * 60 * 18);

  const candidates = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: from,
        lte: to,
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  return candidates.find((m) => {
    const mh = key(m.homeTeam?.name || m.homeTeamId);
    const ma = key(m.awayTeam?.name || m.awayTeamId);
    return mh === h && ma === a;
  });
}

async function syncSport(sport: string) {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ODDS_API_KEY");
  }

  const url =
    `https://api.the-odds-api.com/v4/sports/${sport}/odds` +
    `?apiKey=${apiKey}&regions=eu,uk&markets=h2h,totals&oddsFormat=decimal&dateFormat=iso`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${sport}: ${res.status} ${text}`);
  }

  const games = await res.json();
  let saved = 0;
  let matched = 0;

  for (const game of games) {
    const match = await findMatch(game.home_team, game.away_team, game.commence_time);
    if (!match) continue;

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

  return { sport, matched, saved };
}

export async function GET() {
  const results = [];

  for (const sport of sports) {
    try {
      results.push(await syncSport(sport));
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
