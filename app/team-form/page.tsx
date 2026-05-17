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
    take: 1500,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
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
      const opponent = isHome ? away : home;

      return {
        id: m.id,
        league: m.league?.name ?? "League",
        opponent,
        home,
        away,
        score: `${m.homeGoals}:${m.awayGoals}`,
        teamScore: `${gf}:${ga}`,
        result: gf > ga ? "W" : gf < ga ? "L" : "D",
        kickoff: m.kickoff,
      };
    });

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6">
          <Link href="/" className="text-sm font-bold text-cyan-300">
            ← Zurück
          </Link>

          <div className="mt-6 flex items-center gap-5">
            <TeamBadge team={team || "Team"} size={76} />

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Team Form
              </p>
              <h1 className="page-title mt-2 text-4xl font-black">
                {team || "Team"}
              </h1>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {games.length === 0 ? (
            <div className="glass-card rounded-3xl p-6 text-center text-slate-300">
              Keine letzten Spiele gefunden.
            </div>
          ) : (
            games.map((g) => (
              <article key={g.id} className="glass-card rounded-3xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {g.league}
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      {g.home} vs {g.away}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Gegen {g.opponent} · Team-Sicht {g.teamScore}
                    </p>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-xl font-black ${
                      g.result === "W"
                        ? "bg-emerald-400 text-slate-950"
                        : g.result === "D"
                        ? "bg-yellow-400 text-slate-950"
                        : "bg-red-400 text-slate-950"
                    }`}
                  >
                    {g.result}
                  </div>
                </div>

                <p className="mt-4 text-4xl font-black text-cyan-300">
                  {g.score}
                </p>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
