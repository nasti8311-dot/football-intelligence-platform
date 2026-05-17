import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

function teamKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|afc|sc|sv|club|football|munchen|muenchen/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function TeamFormPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const params = await searchParams;
  const team = params.team || "";

  const matches = await prisma.match.findMany({
    take: 2500,
    orderBy: { kickoff: "desc" },
    include: { homeTeam: true, awayTeam: true, league: true },
  });

  const games = matches
    .filter((m) => {
      if (m.homeGoals === null || m.awayGoals === null) return false;
      const home = m.homeTeam?.name || m.homeTeamId;
      const away = m.awayTeam?.name || m.awayTeamId;
      return teamKey(home) === teamKey(team) || teamKey(away) === teamKey(team);
    })
    .slice(0, 10)
    .map((m) => {
      const home = m.homeTeam?.name || m.homeTeamId;
      const away = m.awayTeam?.name || m.awayTeamId;
      const isHome = teamKey(home) === teamKey(team);

      const gf = isHome ? Number(m.homeGoals) : Number(m.awayGoals);
      const ga = isHome ? Number(m.awayGoals) : Number(m.homeGoals);

      return {
        id: m.id,
        league: m.league?.name ?? "League",
        home,
        away,
        opponent: isHome ? away : home,
        venue: isHome ? "Home" : "Away",
        score: `${m.homeGoals}:${m.awayGoals}`,
        teamScore: `${gf}:${ga}`,
        gf,
        ga,
        total: gf + ga,
        result: gf > ga ? "W" : gf < ga ? "L" : "D",
        kickoff: m.kickoff,
      };
    });

  const wins = games.filter((g) => g.result === "W").length;
  const draws = games.filter((g) => g.result === "D").length;
  const losses = games.filter((g) => g.result === "L").length;
  const goalsFor = games.reduce((s, g) => s + g.gf, 0);
  const goalsAgainst = games.reduce((s, g) => s + g.ga, 0);
  const over25 = games.filter((g) => g.total >= 3).length;
  const btts = games.filter((g) => g.gf > 0 && g.ga > 0).length;

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <Link href="/" className="text-sm font-bold text-cyan-300">
            ← Zurück zu den Picks
          </Link>

          <div className="mt-7 flex items-center gap-5">
            <TeamBadge team={team || "Team"} size={92} />

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Club Form Guide
              </p>
              <h1 className="page-title mt-2 text-4xl font-black md:text-6xl">
                {team || "Team"}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Letzte 10 Spiele, Trends, Tore und Ergebnisform.
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-4 gap-3">
            <Stat label="W" value={String(wins)} />
            <Stat label="D" value={String(draws)} />
            <Stat label="L" value={String(losses)} />
            <Stat label="Tore" value={`${goalsFor}:${goalsAgainst}`} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Trend label="Over 2.5" value={`${over25}/10`} />
            <Trend label="BTTS" value={`${btts}/10`} />
          </div>
        </section>

        <section className="grid gap-4">
          {games.map((g, i) => (
            <article key={g.id} className="glass-card rounded-[2rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black ${
                      g.result === "W"
                        ? "bg-emerald-400 text-slate-950"
                        : g.result === "D"
                        ? "bg-yellow-400 text-slate-950"
                        : "bg-red-400 text-white"
                    }`}
                  >
                    {g.result}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      #{i + 1} · {g.league} · {g.venue}
                    </p>
                    <h2 className="mt-1 text-lg font-black md:text-2xl">
                      {g.home} vs {g.away}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Gegen {g.opponent} · Teamsicht {g.teamScore}
                    </p>
                  </div>
                </div>

                <p className="text-4xl font-black text-cyan-300">{g.score}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Trend({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
