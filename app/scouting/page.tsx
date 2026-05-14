import { prisma } from "@/lib/prisma";

type Player = {
  name: string;
  team: string;
  events: number;
  shots: number;
  passes: number;
  pressures: number;
  xg: number;
  intelligence: number;
  role: string;
};

function role(p: Player) {
  if (p.shots >= 2 && p.xg >= 0.3) return "Finisher";
  if (p.passes >= 2) return "Progressor";
  if (p.pressures >= 1) return "Presser";
  return "Generalist";
}

function score(p: Player) {
  return (
    p.xg * 25 +
    p.shots * 2 +
    p.passes * 0.5 +
    p.pressures * 0.8
  );
}

export default async function ScoutingPage() {
  const events = await prisma.event.findMany({
    where: {
      player: {
        not: null,
      },
    },
  });

  const map = new Map<string, Player>();

  for (const e of events) {
    if (!e.player) continue;

    if (!map.has(e.player)) {
      map.set(e.player, {
        name: e.player,
        team: e.team,
        events: 0,
        shots: 0,
        passes: 0,
        pressures: 0,
        xg: 0,
        intelligence: 0,
        role: "Generalist",
      });
    }

    const p = map.get(e.player)!;

    p.events += 1;

    if (e.eventType === "shot") {
      p.shots += 1;
      p.xg += Number(e.xg ?? 0);
    }

    if (e.eventType === "pass") {
      p.passes += 1;
    }

    if (e.eventType === "pressure") {
      p.pressures += 1;
    }
  }

  const players = [...map.values()]
    .map((p) => ({
      ...p,
      intelligence: score(p),
      role: role(p),
    }))
    .sort((a, b) => b.intelligence - a.intelligence);

  const byRole = {
    Finisher: players.filter((p) => p.role === "Finisher"),
    Progressor: players.filter((p) => p.role === "Progressor"),
    Presser: players.filter((p) => p.role === "Presser"),
    Generalist: players.filter((p) => p.role === "Generalist"),
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Football Intelligence</p>
          <h1 className="text-5xl font-bold">Scouting Dashboard</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Recruitment Intelligence, Player Roles, Squad Profiling
            und quantitative Spieleranalyse.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card title="Players" value={players.length.toString()} />
          <Card
            title="Top Prospect"
            value={players[0]?.name ?? "—"}
          />
          <Card
            title="Best IQ"
            value={
              players[0]
                ? players[0].intelligence.toFixed(1)
                : "—"
            }
          />
          <Card
            title="Top Role"
            value={players[0]?.role ?? "—"}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {Object.entries(byRole).map(([roleName, rolePlayers]) => (
            <section
              key={roleName}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <h2 className="mb-5 text-2xl font-semibold">
                {roleName}
              </h2>

              <div className="space-y-3">
                {rolePlayers.slice(0, 6).map((p) => (
                  <div
                    key={p.name}
                    className="rounded-2xl bg-slate-900 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-slate-400">
                          {p.team}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-cyan-300">
                          {p.intelligence.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-400">
                          IQ Score
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                      <Metric
                        label="Shots"
                        value={p.shots}
                      />
                      <Metric
                        label="Passes"
                        value={p.passes}
                      />
                      <Metric
                        label="Pressure"
                        value={p.pressures}
                      />
                      <Metric
                        label="xG"
                        value={Number(p.xg.toFixed(2))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="mb-5 text-2xl font-semibold">
            Recruitment Ranking
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Shots</th>
                  <th className="p-3">Passes</th>
                  <th className="p-3">Pressure</th>
                  <th className="p-3">xG</th>
                  <th className="p-3">IQ</th>
                </tr>
              </thead>

              <tbody>
                {players.map((p) => (
                  <tr
                    key={p.name}
                    className="border-t border-white/10"
                  >
                    <td className="p-3 font-semibold">
                      {p.name}
                    </td>
                    <td className="p-3">{p.team}</td>
                    <td className="p-3 text-cyan-300">
                      {p.role}
                    </td>
                    <td className="p-3">{p.shots}</td>
                    <td className="p-3">{p.passes}</td>
                    <td className="p-3">{p.pressures}</td>
                    <td className="p-3 text-cyan-300">
                      {p.xg.toFixed(2)}
                    </td>
                    <td className="p-3 font-bold text-emerald-300">
                      {p.intelligence.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 truncate text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-2 text-center">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
