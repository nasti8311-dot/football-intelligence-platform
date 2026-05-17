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

async function saveNews(matchId: string, home: string, away: string) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEWS_API_KEY");
  }

  const q = `"${home}" "${away}" football OR "${home}" injury OR "${away}" injury`;

  const url =
    "https://newsapi.org/v2/everything?" +
    new URLSearchParams({
      q,
      searchIn: "title,description",
      language: "en",
      sortBy: "publishedAt",
      pageSize: "5",
      apiKey,
    });

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NewsAPI ${res.status}: ${text}`);
  }

  const data = await res.json();
  const articles = data.articles || [];

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
      q
    );

    saved++;
  }

  return saved;
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
  }));

  const picks = buildPredictions(matches)
    .filter((p) => p.kickoff && dateKey(new Date(p.kickoff)) === today)
    .sort((a, b) => {
      if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
      return b.bestProbability - a.bestProbability;
    })
    .slice(0, 10);

  const results = [];

  for (const p of picks) {
    try {
      const saved = await saveNews(p.id, p.home, p.away);
      results.push({ match: `${p.home} vs ${p.away}`, saved });
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
