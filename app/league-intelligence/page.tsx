import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeagueIntelligencePage() {
  const leagues = await prisma.league.findMany({
    include: {
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  });

  const rows = leagues.map((l) => {
    const matches = l.matches;
    const goals = matches.reduce(
      (s, m) => s + Number(m.homeGoals ?? 0) + Number(m.awayGoals ?? 0),
      0
    );

    const homeWins = matches.filter(
      (m) => Number(m.homeGoals ?? 0) > Number(m.awayGoals ?? 0)
    ).length;

    const draws = matches.filter(
      (m) => Number(m.homeGoals ?? 0) === Number(m.awayGoals ?? 0)
    ).length;

    const awayWins = matches.filter(
      (m) => Number(m.homeGoals ?? 0) < Number(m.awayGoals ?? 0)
    ).length;

    return {
      code: l.code,
      name: l.name,
      country: l.country,
      matches: matches.length,
      goals,
      avgGoals: matches.length ? (goals / matches.length).toFixed(2) : "0.00",
      homeWins,
      draws,
      awayWins,
      intensity:
        goals / Math.max(1, matches.length) > 3
          ? "High scoring"
          : goals / Math.max(1, matches.length) > 2.4
          ? "Balanced"
          : "Low scoring",
    };
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Competition Intelligence</p>
          <h1 className="text-5xl font-bold">League Intelligence</h1>
          <p className="mt-3 text-slate-400">
            Vergleich aller importierten Ligen nach Toren, Spielstil und Matchvolumen.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((l) => (
            <div
              key={l.code}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-sm text-cyan-300">{l.country ?? l.code}</p>
              <h2 className="mt-2 text-3xl font-bold">{l.name}</h2>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Stat label="Matches" value={l.matches.toString()} />
                <Stat label="Goals" value={l.goals.toString()} />
                <Stat label="Avg Goals" value={l.avgGoals} />
                <Stat label="Style" value={l.intensity} />
              </div>

              <div className="mt-6 space-y-3">
                <Bar label="Home Wins" value={l.homeWins} max={l.matches} />
                <Bar label="Draws" value={l.draws} max={l.matches} />
                <Bar label="Away Wins" value={l.awayWins} max={l.matches} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max ? Math.round((value / max) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-cyan-300">{pct}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
