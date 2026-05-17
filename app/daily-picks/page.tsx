import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import { buildPredictions, topDailyPicks } from "@/lib/predictions";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function DailyPicksPage() {
  const rows = await prisma.match.findMany({
    take: 2500,
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

  const allPredictions = buildPredictions(matches);
  const today = dateKey(new Date());

  const todayPredictions = allPredictions.filter((p) => {
    if (!p.kickoff) return false;
    return dateKey(new Date(p.kickoff)) === today;
  });

  const picks = topDailyPicks(todayPredictions, 10);

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Daily Top 10
          </p>

          <h1 className="page-title mt-4 text-4xl font-black leading-tight md:text-6xl">
            10 beste Football Picks
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Jeden Tag die stärksten heutigen Spiele nach Value Score,
            Form, Elo, Heim-/Auswärtsprofil und Poisson-Modell.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Top label="Picks" value={String(picks.length)} />
            <Top label="Heute" value={String(picks.length)} />
            <Top label="Modell" value="Elo+" />
          </div>
        </section>

        <section className="glass-card rounded-[2rem] border border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-3xl">
              🏆
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Coming Soon
              </p>
              <h2 className="text-2xl font-black">
                WM 2026 Predictions
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Bald mit täglichen World Cup Picks, Gruppenphase, Knockout-Wahrscheinlichkeiten und Spezialmärkten.
              </p>
            </div>
          </div>
        </section>

        {picks.length === 0 ? (
          <section className="glass-card rounded-3xl p-8 text-center">
            <h2 className="text-3xl font-black">Keine Picks gefunden</h2>
            <p className="mt-3 text-slate-300">
              Synchronisiere Fixtures oder prüfe deine Datenquelle.
            </p>
          </section>
        ) : (
          <section className="grid gap-5">
            {picks.map((p, index) => {
              const isToday = p.kickoff && dateKey(new Date(p.kickoff)) === today;

              return (
                <article key={p.id} className="glass-card rounded-[2rem] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                        #{index + 1} · {p.league}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {p.kickoff
                          ? new Date(p.kickoff).toLocaleDateString("de-DE")
                          : "No date"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!isToday && (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                          Next
                        </span>
                      )}
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
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <Link
                      href={`/team-form?team=${encodeURIComponent(p.home)}`}
                      className="flex flex-1 flex-col items-center text-center"
                    >
                      <TeamBadge team={p.home} size={66} />
                      <p className="mt-3 text-sm font-black">{p.home}</p>
                      <p className="mt-1 text-[11px] text-cyan-300">
                        Form ansehen
                      </p>
                    </Link>

                    <div className="text-center">
                      <p className="text-xs text-slate-500">Top Pick</p>
                      <p className="mt-1 text-4xl font-black text-cyan-300">
                        {pct(p.bestProbability)}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-300">
                        {p.bestMarket}
                      </p>
                    </div>

                    <Link
                      href={`/team-form?team=${encodeURIComponent(p.away)}`}
                      className="flex flex-1 flex-col items-center text-center"
                    >
                      <TeamBadge team={p.away} size={66} />
                      <p className="mt-3 text-sm font-black">{p.away}</p>
                      <p className="mt-1 text-[11px] text-cyan-300">
                        Form ansehen
                      </p>
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <Market label="1" value={pct(p.homeWin)} tone="cyan" />
                    <Market label="X" value={pct(p.draw)} tone="slate" />
                    <Market label="2" value={pct(p.awayWin)} tone="cyan" />
                    <Market label="Over 2.5" value={pct(p.over25)} tone="green" />
                    <Market label="Under 2.5" value={pct(p.under25)} tone="blue" />
                    <Market label="BTTS" value={pct(p.bttsYes)} tone="pink" />
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                    <p className="text-sm font-bold text-cyan-300">
                      Begründung
                    </p>
                    <p className="mt-2 text-sm text-slate-300">{p.reason}</p>
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

function Top({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Market({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "green" | "blue" | "pink" | "slate";
}) {
  const tones = {
    cyan: "from-cyan-400/20 to-cyan-400/5 border-cyan-400/20 text-cyan-300",
    green: "from-emerald-400/20 to-emerald-400/5 border-emerald-400/20 text-emerald-300",
    blue: "from-sky-400/20 to-sky-400/5 border-sky-400/20 text-sky-300",
    pink: "from-fuchsia-400/20 to-fuchsia-400/5 border-fuchsia-400/20 text-fuchsia-300",
    slate: "from-white/10 to-white/5 border-white/10 text-slate-300",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-3 text-center ${tones[tone]}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
