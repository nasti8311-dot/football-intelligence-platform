import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import { buildPredictions } from "@/lib/predictions";
import { premiumAdjustPredictions } from "@/lib/premium-model";
import { advancedTune } from "@/lib/advanced-tuning";
import { analyzeNews } from "@/lib/news-intelligence";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

function teamKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|afc|sc|sv|club|football|munchen|muenchen/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  const row = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      bookmakerOdds: true,
    },
  });

  if (!row) {
    return (
      <main className="min-h-screen stadium-page px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <section className="glass-card rounded-[2rem] p-8">
            <h1 className="text-3xl font-black">Match not found</h1>
            <Link href="/" className="mt-5 inline-block text-cyan-300">
              Back to picks
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const allRows = await prisma.match.findMany({
    take: 900,
    orderBy: { kickoff: "asc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      bookmakerOdds: true,
    },
  });

  const newsRows = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "MatchNews"
     WHERE "matchId" = $1
     ORDER BY "publishedAt" DESC NULLS LAST
     LIMIT 8`,
    matchId
  ).catch(() => [])) as any[];

  const calibrationRows = (await prisma.$queryRawUnsafe(`
    SELECT "market","sampleSize","accuracy","roi"
    FROM "ModelCalibration"
  `).catch(() => [])) as any[];

  const leagueCalibrationRows = (await prisma.$queryRawUnsafe(`
    SELECT "league","sampleSize","accuracy","roi"
    FROM "LeagueCalibration"
  `).catch(() => [])) as any[];

  const matches = allRows.map((m) => ({
    id: m.id,
    kickoff: m.kickoff,
    league: m.league?.name ?? "League",
    home: m.homeTeam?.name || m.homeTeamId,
    away: m.awayTeam?.name || m.awayTeamId,
    homeGoals: m.homeGoals,
    awayGoals: m.awayGoals,
    odds: (m as any).bookmakerOdds || [],
    news: m.id === matchId ? newsRows : [],
  }));

  const predictions = advancedTune(
    premiumAdjustPredictions(buildPredictions(matches as any), calibrationRows),
    calibrationRows,
    leagueCalibrationRows
  );

  const p = predictions.find((x: any) => x.id === matchId);

  const home = row.homeTeam?.name || row.homeTeamId;
  const away = row.awayTeam?.name || row.awayTeamId;
  const newsIntel = analyzeNews(newsRows);

  const formRows = allRows
    .filter((m) => m.homeGoals !== null && m.awayGoals !== null)
    .filter((m) => {
      const h = m.homeTeam?.name || m.homeTeamId;
      const a = m.awayTeam?.name || m.awayTeamId;
      return (
        teamKey(h) === teamKey(home) ||
        teamKey(a) === teamKey(home) ||
        teamKey(h) === teamKey(away) ||
        teamKey(a) === teamKey(away)
      );
    })
    .slice(-30);

  const homeForm = formRows.filter((m) => {
    const h = m.homeTeam?.name || m.homeTeamId;
    const a = m.awayTeam?.name || m.awayTeamId;
    return teamKey(h) === teamKey(home) || teamKey(a) === teamKey(home);
  }).slice(-5);

  const awayForm = formRows.filter((m) => {
    const h = m.homeTeam?.name || m.homeTeamId;
    const a = m.awayTeam?.name || m.awayTeamId;
    return teamKey(h) === teamKey(away) || teamKey(a) === teamKey(away);
  }).slice(-5);

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <Link href="/" className="text-sm font-bold text-cyan-300">
            ← Back to daily picks
          </Link>

          <div className="mt-8 grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="text-center md:text-left">
              <TeamBadge team={home} size={100} />
              <h1 className="mt-4 text-3xl font-black md:text-5xl">{home}</h1>
            </div>

            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                {row.league?.name || "Match"}
              </p>
              <p className="mt-3 text-5xl font-black text-white">VS</p>
              <p className="mt-3 text-sm text-slate-400">
                {row.kickoff
                  ? new Date(row.kickoff).toLocaleString("de-DE")
                  : "Kickoff TBA"}
              </p>
            </div>

            <div className="text-center md:text-right">
              <div className="flex justify-center md:justify-end">
                <TeamBadge team={away} size={100} />
              </div>
              <h1 className="mt-4 text-3xl font-black md:text-5xl">{away}</h1>
            </div>
          </div>
        </section>

        {p && (
          <section className="grid gap-4 md:grid-cols-4">
            <Metric label="Top Pick" value={p.bestMarket} />
            <Metric label="Probability" value={pct(p.bestProbability)} />
            <Metric label="xG Projection" value={`${p.homeXg.toFixed(1)} : ${p.awayXg.toFixed(1)}`} />
            <Metric label="Tuned Score" value={String(p.tunedScore ?? p.valueScore)} />
          </section>
        )}

        {p && (
          <section className="glass-card rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
              AI Match Analysis
            </p>
            <h2 className="mt-2 text-3xl font-black">
              {p.recommendation || p.premiumTier || "Model Pick"} · {p.bestMarket}
            </h2>

            <p className="mt-4 text-slate-300">
              {p.summary || p.reason}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {(p.trends || []).map((t: string) => (
                <span key={t} className="rounded-full bg-slate-950/70 px-3 py-2 text-xs font-bold text-slate-200">
                  {t}
                </span>
              ))}

              {newsIntel.tags.map((t: string) => (
                <span key={t} className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <FormPanel title={`${home} Form`} rows={homeForm} team={home} />
          <FormPanel title={`${away} Form`} rows={awayForm} team={away} />
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">News Intelligence</h2>
          <p className="mt-2 text-sm text-slate-400">
            Risk level: {newsIntel.risk} · {newsRows.length} articles found
          </p>

          <div className="mt-5 grid gap-3">
            {newsRows.length === 0 ? (
              <div className="rounded-2xl bg-yellow-400/10 p-4 text-sm text-yellow-200">
                No stored news yet for this match. Run the news sync to collect articles.
              </div>
            ) : (
              newsRows.map((n: any) => (
                <a
                  key={n.url}
                  href={n.url}
                  target="_blank"
                  className="rounded-2xl bg-slate-950/60 p-4 hover:bg-slate-900"
                >
                  <p className="font-black text-white">{n.title}</p>
                  <p className="mt-1 text-xs text-cyan-300">{n.source || "News"}</p>
                  {n.description && (
                    <p className="mt-2 text-sm text-slate-400">{n.description}</p>
                  )}
                </a>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-3xl p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function FormPanel({ title, rows, team }: { title: string; rows: any[]; team: string }) {
  return (
    <section className="glass-card rounded-[2rem] p-6">
      <h2 className="text-2xl font-black">{title}</h2>

      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400">No recent results available.</p>
        ) : (
          rows.map((m) => {
            const home = m.homeTeam?.name || m.homeTeamId;
            const away = m.awayTeam?.name || m.awayTeamId;
            const isHome = teamKey(home) === teamKey(team);
            const gf = isHome ? Number(m.homeGoals) : Number(m.awayGoals);
            const ga = isHome ? Number(m.awayGoals) : Number(m.homeGoals);
            const result = gf > ga ? "W" : gf < ga ? "L" : "D";

            return (
              <div key={m.id} className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-4">
                <div>
                  <p className="font-bold text-white">{home} vs {away}</p>
                  <p className="text-xs text-slate-500">{m.league?.name || "League"}</p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-cyan-300">{m.homeGoals}:{m.awayGoals}</p>
                  <p className="text-xs text-slate-400">{result}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
