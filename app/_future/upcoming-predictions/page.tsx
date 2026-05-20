import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import { buildPredictions } from "@/lib/predictions";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

export default async function UpcomingPredictionsPage() {
  const rows = await prisma.match.findMany({
    take: 1800,
    orderBy: { kickoff: "asc" },
    include: { homeTeam: true, awayTeam: true, league: true },
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

  const predictions = buildPredictions(matches).sort(
    (a, b) => Number(a.kickoff) - Number(b.kickoff)
  );

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Upcoming Matches
          </p>
          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Alle kommenden Predictions
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Alle zukünftigen Spiele mit 1X2, Over/Under 2.5, BTTS, xG und Confidence.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Top label="Spiele" value={String(predictions.length)} />
            <Top label="Top Pick" value={predictions[0] ? pct(predictions[0].bestProbability) : "0%"} />
            <Top label="Engine" value="Elo+" />
          </div>
        </section>

        {predictions.length === 0 ? (
          <section className="glass-card rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-black">Keine kommenden Spiele gefunden</h2>
            <p className="mt-3 text-slate-300">
              Synchronisiere echte Fixtures mit football-data.org oder importiere Fixture-CSV-Dateien.
            </p>
          </section>
        ) : (
          <section className="grid gap-5">
            {predictions.map((p) => (
              <article key={p.id} className="glass-card rounded-[2rem] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {p.league}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {p.kickoff ? new Date(p.kickoff).toLocaleDateString("de-DE") : "No date"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      p.confidence === "High"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : p.confidence === "Medium"
                        ? "bg-yellow-400/15 text-yellow-300"
                        : "bg-red-400/15 text-red-300"
                    }`}
                  >
                    {p.confidence}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <TeamBadge team={p.home} size={64} />
                    <p className="mt-3 text-sm font-black">{p.home}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-slate-500">Top Pick</p>
                    <p className="mt-1 text-4xl font-black text-cyan-300">
                      {pct(p.bestProbability)}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-300">
                      {p.bestMarket}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col items-center text-center">
                    <TeamBadge team={p.away} size={64} />
                    <p className="mt-3 text-sm font-black">{p.away}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <Mini label="1" value={pct(p.homeWin)} />
                  <Mini label="X" value={pct(p.draw)} />
                  <Mini label="2" value={pct(p.awayWin)} />
                  <Mini label="Over 2.5" value={pct(p.over25)} />
                  <Mini label="Under 2.5" value={pct(p.under25)} />
                  <Mini label="BTTS" value={pct(p.bttsYes)} />
                </div>

                <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-sm font-bold text-cyan-300">Analyse</p>
                  <p className="mt-2 text-sm text-slate-300">{p.reason}</p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function Top({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3 text-center">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-cyan-300">{value}</p>
    </div>
  );
}
