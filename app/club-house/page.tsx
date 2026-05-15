import PageHero from "@/components/PageHero";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";

export const dynamic = "force-dynamic";

export default async function ClubHousePage() {
  const teams = await prisma.team.findMany({
    take: 60,
    orderBy: { name: "asc" },
  });

  const matches = await prisma.match.findMany({
    take: 500,
    include: { homeTeam: true, awayTeam: true },
  });

  const rows = teams.map((team) => {
    const teamMatches = matches.filter((m) => {
      const home = m.homeTeam?.name || m.homeTeamId;
      const away = m.awayTeam?.name || m.awayTeamId;
      return home === team.name || away === team.name;
    });

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let gf = 0;
    let ga = 0;

    for (const m of teamMatches) {
      const home = m.homeTeam?.name || m.homeTeamId;
      const isHome = home === team.name;

      const forGoals = isHome ? Number(m.homeGoals ?? 0) : Number(m.awayGoals ?? 0);
      const againstGoals = isHome ? Number(m.awayGoals ?? 0) : Number(m.homeGoals ?? 0);

      gf += forGoals;
      ga += againstGoals;

      if (forGoals > againstGoals) wins++;
      else if (forGoals < againstGoals) losses++;
      else draws++;
    }

    const points = wins * 3 + draws;
    const status =
      points > 30 ? "Elite Form" : points > 18 ? "Competitive" : "Needs Work";

    return {
      team,
      played: teamMatches.length,
      wins,
      draws,
      losses,
      gf,
      ga,
      points,
      status,
    };
  });

  rows.sort((a, b) => b.points - a.points);

  return (
    <main className="min-h-screen stadium-page/80 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="glass-card rounded-3xl p-8 glow">
          <p className="text-sm text-cyan-400">Club Overview</p>
          <h1 className="page-title mt-2 text-5xl font-black">Club House</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Alle Clubs als moderne Karten mit Form, Torbilanz und Schnellzugriff auf Detailanalysen.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <div key={row.team.id} className="glass-card rounded-3xl p-6 transition hover:scale-[1.02]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <TeamBadge team={row.team.name} size={64} />
                  <div>
                    <h2 className="text-2xl font-black">{row.team.name}</h2>
                    <p className="mt-1 text-sm text-cyan-300">{row.status}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-400">Pts</p>
                  <p className="text-3xl font-black text-cyan-300">{row.points}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-3 text-center">
                <Mini label="P" value={row.played} />
                <Mini label="W" value={row.wins} />
                <Mini label="D" value={row.draws} />
                <Mini label="L" value={row.losses} />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-950/60 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Goals</span>
                  <span className="font-bold text-white">{row.gf}:{row.ga}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-cyan-400"
                    style={{ width: `${Math.min(100, row.points * 3)}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  href={`/team-profile?team=${encodeURIComponent(row.team.name)}`}
                  className="flex-1 rounded-2xl bg-cyan-400 px-4 py-3 text-center font-bold text-slate-950"
                >
                  Profile
                </Link>

                <Link
                  href={`/opponent-prep?team=${encodeURIComponent(row.team.name)}`}
                  className="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-center font-bold text-white"
                >
                  Prep
                </Link>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
