import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPredictions } from "@/lib/predictions";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function NewsPage() {
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
    odds: (m as any).bookmakerOdds || [],
    news: [],
  }));

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const predictions = buildPredictions(matches, dayStart)
    .filter((p) => p.kickoff && dateKey(new Date(p.kickoff)) === today)
    .sort((a, b) => {
      if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
      return b.bestProbability - a.bestProbability;
    })
    .slice(0, 10);

  const ids = predictions.map((p) => p.id);

  let newsRows: any[] = [];

  try {
    newsRows = ids.length
      ? await prisma.$queryRawUnsafe(
          `SELECT * FROM "MatchNews" WHERE "matchId" = ANY($1) ORDER BY "publishedAt" DESC NULLS LAST`,
          ids
        )
      : [];
  } catch (error) {
    newsRows = [];
  }

  const newsMap = new Map<string, any[]>();

  for (const n of newsRows) {
    const list = newsMap.get(n.matchId) || [];
    if (list.length < 4) {
      list.push(n);
      newsMap.set(n.matchId, list);
    }
  }

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Match Intelligence
          </p>

          <h1 className="page-title mt-4 text-4xl font-black leading-tight md:text-6xl">
            News zu heutigen Picks
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Tägliche News, Team-Updates, Verletzungs- und Formhinweise zu den Spielen auf der Startseite.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Zurück zu Picks
          </Link>
        </section>

        <section className="glass-card rounded-[2rem] border border-emerald-400/10 bg-emerald-400/5 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
            Automatisch aktualisiert
          </p>
          <h2 className="mt-2 text-2xl font-black">
            News-Kontext für deine Daily Picks
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Diese Seite zeigt nur News zu den Spielen, die auch auf der Startseite als Picks erscheinen.
          </p>
        </section>

        {predictions.length === 0 ? (
          <section className="glass-card rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-black">Keine heutigen Picks gefunden</h2>
            <p className="mt-3 text-slate-300">
              Sobald heutige Spiele vorhanden sind, erscheinen hier passende News.
            </p>
          </section>
        ) : (
          <section className="grid gap-5">
            {predictions.map((p) => {
              const news = newsMap.get(p.id) || [];

              return (
                <article key={p.id} className="glass-card rounded-[2rem] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <TeamBadge team={p.home} size={52} />
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                          {p.league}
                        </p>
                        <h2 className="mt-1 text-xl font-black">
                          {p.home} vs {p.away}
                        </h2>
                      </div>
                    </div>

                    <TeamBadge team={p.away} size={52} />
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-sm font-bold text-cyan-300">
                      Prediction Kontext
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      Top Pick: {p.bestMarket} · Modellwahrscheinlichkeit {Math.round(p.bestProbability)}%
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {news.length === 0 ? (
                      <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400">
                        Noch keine gespeicherten News für dieses Spiel. Der tägliche News-Sync sammelt automatisch relevante Artikel, sobald News verfügbar sind.
                      </div>
                    ) : (
                      news.map((n: any) => (
                        <a
                          key={n.id}
                          href={n.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-2xl bg-slate-950/60 p-4 transition hover:bg-slate-900"
                        >
                          <p className="text-xs text-cyan-300">
                            {n.source || "News"} {n.publishedAt ? `· ${new Date(n.publishedAt).toLocaleDateString("de-DE")}` : ""}
                          </p>
                          <h3 className="mt-2 font-black text-white">
                            {n.title}
                          </h3>
                          {n.description && (
                            <p className="mt-2 text-sm text-slate-400">
                              {n.description}
                            </p>
                          )}
                        </a>
                      ))
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
