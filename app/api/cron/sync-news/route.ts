import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchNews(query: string) {
  const key = process.env.NEWS_API_KEY;

  if (!key) return [];

  const url =
    `https://newsapi.org/v2/everything?` +
    `q=${encodeURIComponent(query)}` +
    `&language=de` +
    `&sortBy=publishedAt` +
    `&pageSize=5` +
    `&apiKey=${key}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = await res.json();

  return data.articles || [];
}

export async function GET() {
  const now = new Date();

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
        lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 30,
  });

  const results = [];

  for (const match of matches) {
    const queries = [
      `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      `${match.homeTeam.name} news`,
      `${match.awayTeam.name} news`,
      `${match.homeTeam.name} injuries`,
      `${match.awayTeam.name} injuries`,
    ];

    let saved = 0;

    for (const q of queries) {
      const articles = await fetchNews(q);

      for (const article of articles) {
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO "MatchNews"
              ("id","matchId","title","description","url","imageUrl","source","publishedAt","createdAt","updatedAt")
             VALUES
              (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
             ON CONFLICT ("url") DO NOTHING`,
            match.id,
            article.title || "Ohne Titel",
            article.description || "",
            article.url,
            article.urlToImage || null,
            article.source?.name || "News",
            article.publishedAt ? new Date(article.publishedAt) : new Date()
          );

          saved++;
        } catch {}
      }
    }

    results.push({
      match:
        `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      saved,
    });
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    matches: matches.length,
    results,
  });
}
