import TeamBadge from "@/components/TeamBadge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamIntelligencePage() {
  const matches = await prisma.match.findMany({
    take: 400,
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  const table = new Map<string, any>();

  function initTeam(name: string) {
    if (!table.has(name)) {
      table.set(name, {
        team: name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        points: 0,
      });
    }
  }

  for (const m of matches) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const away = m.awayTeam?.name || m.awayTeamId;

    initTeam(home);
    initTeam(away);

    const h = table.get(home);
    const a = table.get(away);

    h.played++;
    a.played++;

    h.gf += m.homeGoals || 0;
    h.ga += m.awayGoals || 0;

    a.gf += m.awayGoals || 0;
    a.ga += m.homeGoals || 0;

    if ((m.homeGoals || 0) > (m.awayGoals || 0)) {
      h.wins++;
      a.losses++;
      h.points += 3;
    } else if ((m.homeGoals || 0) < (m.awayGoals || 0)) {
      a.wins++;
      h.losses++;
      a.points += 3;
    } else {
      h.draws++;
      a.draws++;
      h.points++;
      a.points++;
    }
  }

  const teams = [...table.values()]
    .map((t) => ({
      ...t,
      gd: t.gf - t.ga,
      attack:
        t.gf > 40 ? "Elite" : t.gf > 25 ? "Strong" : "Average",
      defense:
        t.ga < 20 ? "Elite" : t.ga < 35 ? "Strong" : "Weak",
      style:
        t.gf > t.ga + 15
          ? "Aggressive attacking"
          : t.ga < t.gf
          ? "Balanced"
          : "Defensive transition",
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Club Intelligence</p>
          <h1 className="text-5xl font-bold">Team Intelligence</h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Tactical profiles, performance analytics and automated
            strength evaluation for all tracked clubs.
          </p>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="p-4 text-left">Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
                <th>Attack</th>
                <th>Defense</th>
              </tr>
            </thead>

            <tbody>
              {teams.map((t) => (
                <tr
                  key={t.team}
                  className="border-t border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="p-4 font-semibold">{t.team}</td>
                  <td>{t.played}</td>
                  <td>{t.wins}</td>
                  <td>{t.draws}</td>
                  <td>{t.losses}</td>
                  <td>{t.gf}</td>
                  <td>{t.ga}</td>
                  <td>{t.gd}</td>
                  <td className="font-bold text-cyan-300">{t.points}</td>
                  <td>{t.attack}</td>
                  <td>{t.defense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {teams.slice(0, 9).map((t) => (
            <div
              key={t.team}
              className="glass-card rounded-3xl p-6"
            >
              <p className="text-sm text-cyan-300">Tactical Profile</p>

              <h2 className="mt-2 text-3xl font-bold">{t.team}</h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Playing Style</span>
                  <span>{t.style}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Attack Level</span>
                  <span>{t.attack}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Defense Level</span>
                  <span>{t.defense}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Goal Difference</span>
                  <span>{t.gd}</span>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-slate-800">
                <div
                  className="h-3 rounded-full bg-cyan-400"
                  style={{
                    width: `${Math.min(100, t.points)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
