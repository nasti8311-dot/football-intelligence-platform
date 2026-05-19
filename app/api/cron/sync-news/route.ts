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

function simplifyTeam(name: string) {
  return String(name || "")
    .replace(/\bFC\b/g, "")
    .replace(/\bCF\b/g, "")
    .replace(/\bAC\b/g, "")
    .replace(/\bSC\b/g, "")
    .replace(/\bCalcio\b/g, "")
    .replace(/\bBalompié\b/g, "")
    .replace(/\b1901\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchNews(query: string, apiKey: string) {
  const url =
    "https://newsapi.org/v2/everything?" +
    new URLSearchParams({
      q: query,
      searchIn: "title,description",
      language: "en",
      sortBy: "publishedAt",
      pageSize: "4",
      apiKey,
    });

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.articles || [];
}

async function saveArticles(matchId: string, query: string, articles: any[]) {
  let saved = 0;

  for (const a of articles) {
    if (!a.url || !a.title) continue;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "MatchNews"
        ("id","matchId","title","description","url","source","imageUrl","publishedAt","query","createdAt","updatedAt")
       VALUES
        (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
       ON CONFLICT ("matchId","url")
       DO UPDATE SET
        "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "source" = EXCLUDED."source",
        "imageUrl" = EXCLUDED."imageUrl",
        "publishedAt" = EXCLUDED."publishedAt",
        "query" = EXCLUDED."query",
        "updatedAt" = NOW()`,
      matchId,
      a.title,
      a.description || null,
      a.url,
      a.source?.name || null,
      a.urlToImage || null,
      a.publishedAt ? new Date(a.publishedAt) : null,
      query
    );

    saved++;
  }

  return saved;
}

async function saveNews(matchId: string, home: string, away: string) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEWS_API_KEY");
  }

  const h = simplifyTeam(home);
  const a = simplifyTeam(away);

  const queries = [
    `"${h}" "${a}" football`,
    `"${h}" team news injury lineup`,
    `"${a}" team news injury lineup`,
    `"${h}" football`,
    `"${a}" football`,
  ];

  let totalSaved = 0;
  const debug = [];

  for (const q of queries) {
    const articles = await fetchNews(q, apiKey);
    const saved = await saveArticles(matchId, q, articles);
    totalSaved += saved;
    debug.push({ q, found: articles.length, saved });

    if (totalSaved >= 6) break;
  }

  return { saved: totalSaved, debug };
}

export async function GET() {
  const today = dateKey(new Date());

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const rows = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    },
    take: 2000,
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

  const picks = buildPredictions(matches, dayStart)
    .filter((p) => p.kickoff && dateKey(new Date(p.kickoff)) === today)
    .sort((a, b) => {
      if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
      return b.bestProbability - a.bestProbability;
    })
    .slice(0, 10);

  const results = [];

  for (const p of picks) {
    try {
      const result = await saveNews(p.id, p.home, p.away);
      results.push({ match: `${p.home} vs ${p.away}`, ...result });
    } catch (e: any) {
      results.push({
        match: `${p.home} vs ${p.away}`,
        error: e?.message || "Unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    matches: picks.length,
    results,
  });
}
