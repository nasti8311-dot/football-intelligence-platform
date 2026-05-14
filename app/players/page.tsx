import { prisma } from "@/lib/prisma";

type PlayerProfile = {
  name: string;
  team: string;
  events: number;
  shots: number;
  passes: number;
  pressures: number;
  xg: number;
  passShare: number;
  shotShare: number;
  pressureShare: number;
  intelligence: number;
  role: string;
};

function classifyRole(p: PlayerProfile) {
  if (p.shotShare > 0.35 && p.xg > 0.25) return "Finisher / Forward";
  if (p.passShare > 0.65) return "Progressor / Midfielder";
  if (p.pressureShare > 0.35) return "Pressing Specialist";
  if (p.passes > p.shots && p.pressures > 0) return "Two-Way Contributor";
  return "Generalist";
}

function similarity(a: PlayerProfile, b: PlayerProfile) {
  const diff =
    Math.abs(a.shotShare - b.shotShare) +
    Math.abs(a.passShare - b.passShare) +
    Math.abs(a.pressureShare - b.pressureShare) +
    Math.abs(a.xg - b.xg);

  return Math.max(0, 100 - diff * 100);
}

export default async function PlayersPage() {
  const events = await prisma.event.findMany({
    where: {
      player: {
        not: null,
      },
    },
  });

  const playerMap = new Map<
    string,
    {
      team: string;
      events: number;
      shots: number;
      passes: number;
      pressures: number;
      xg: number;
    }
  >();

  for (const e of events) {
    if (!e.player) continue;

    if (!playerMap.has(e.player)) {
      playerMap.set(e.player, {
        team: e.team,
        events: 0,
        shots: 0,
        passes: 0,
        pressures: 0,
        xg: 0,
      });
    }

    const p = playerMap.get(e.player)!;

    p.events += 1;
    if (e.eventType === "shot") {
      p.shots += 1;
      p.xg += Number(e.xg ?? 0);
    }
    if (e.eventType === "pass") p.passes += 1;
    if (e.eventType === "pressure") p.pressures += 1;
  }

  const players: PlayerProfile[] = [...playerMap.entries()]
    .map(([name, stats]) => {
      const total = Math.max(1, stats.events);
      const base = {
        name,
        ...stats,
        passShare: stats.passes / total,
        shotShare: stats.shots / total,
        pressureShare: stats.pressures / total,
        intelligence:
          stats.xg * 25 +
          stats.passes * 0.4 +
          stats.pressures * 0.7 +
          stats.shots * 1.5,
        role: "Generalist",
      };

      return {
        ...base,
        role: classifyRole(base),
      };
    })
    .sort((a, b) => b.intelligence - a.intelligence);

  const topPlayer = players[0];
  const similarPlayers = topPlayer
    ? players
        .filter((p) => p.name !== topPlayer.name)
        .map((p) => ({
          ...p,
          similarity: similarity(topPlayer, p),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5)
    : [];

  const recruitmentShortlist = players
    .filter((p) => p.events >= 1)
    .sort((a, b) => b.intelligence - a.intelligence)
    .slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Scouting Intelligence</p>
          <h1 className="text-4xl font-bold">Player Analytics</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Spielerprofile, Rollenklassifikation, Similarity Matching und
            Recruitment Shortlist auf Basis deiner Eventdaten.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Kpi title="Players" value={players.length.toString()} />
          <Kpi title="Top Player" value={topPlayer?.name ?? "—"} />
          <Kpi title="Top Role" value={topPlayer?.role ?? "—"} />
          <Kpi
            title="Best IQ"
            value={topPlayer ? topPlayer.intelligence.toFixed(1) : "—"}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Recruitment Shortlist">
            <div className="space-y-3">
              {recruitmentShortlist.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-slate-400">
                      {p.team} · {p.role}
                    </p>
                  </div>
                  <p className="font-bold text-emerald-300">
                    {p.intelligence.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Similarity Finder">
            <p className="mb-4 text-sm text-slate-400">
              Referenzspieler: {topPlayer?.name ?? "Keine Daten"}
            </p>
            <div className="space-y-3">
              {similarPlayers.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-slate-400">{p.role}</p>
                  </div>
                  <p className="font-bold text-cyan-300">
                    {p.similarity.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-4 text-xl font-semibold">Player Intelligence Table</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Events</th>
                  <th className="p-3">Shots</th>
                  <th className="p-3">Passes</th>
                  <th className="p-3">Pressures</th>
                  <th className="p-3">xG</th>
                  <th className="p-3">IQ Score</th>
                </tr>
              </thead>

              <tbody>
                {players.map((p) => (
                  <tr key={p.name} className="border-t border-white/10">
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3">{p.team}</td>
                    <td className="p-3 text-cyan-300">{p.role}</td>
                    <td className="p-3">{p.events}</td>
                    <td className="p-3">{p.shots}</td>
                    <td className="p-3">{p.passes}</td>
                    <td className="p-3">{p.pressures}</td>
                    <td className="p-3 text-cyan-300">{p.xg.toFixed(2)}</td>
                    <td className="p-3 font-bold text-emerald-300">
                      {p.intelligence.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {players.length === 0 && (
              <p className="mt-6 text-slate-400">
                Keine Spieler-Events vorhanden. Importiere CSVs mit
                einer player-Spalte.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 truncate text-2xl font-bold">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}