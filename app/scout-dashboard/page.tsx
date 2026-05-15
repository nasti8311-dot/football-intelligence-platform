import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PlayerRow = {
  player: string;
  team: string;
  shots: number;
  passes: number;
  tackles: number;
  carries: number;
  xg: number;
  score: number;
  role: string;
};

export default async function ScoutDashboardPage() {
  const events = await prisma.event.findMany({
    take: 20000,
  });

  const players = new Map<string, PlayerRow>();

  for (const e of events) {
    if (!e.player) continue;

    if (!players.has(e.player)) {
      players.set(e.player, {
        player: e.player,
        team: e.team ?? "Unknown",
        shots: 0,
        passes: 0,
        tackles: 0,
        carries: 0,
        xg: 0,
        score: 0,
        role: "Balanced",
      });
    }

    const p = players.get(e.player)!;

    if (e.eventType === "shot") p.shots++;
    if (e.eventType === "pass") p.passes++;
    if (e.eventType === "tackle") p.tackles++;
    if (e.eventType === "carry") p.carries++;

    p.xg += Number(e.xg ?? 0);
  }

  const rows = [...players.values()].map((p) => {
    const score = Math.round(
      p.shots * 4 +
      p.passes * 0.4 +
      p.tackles * 2 +
      p.carries * 1.5 +
      p.xg * 30
    );

    const role =
      p.shots > p.passes * 0.2
        ? "Finisher"
        : p.passes > p.carries
        ? "Playmaker"
        : p.tackles > p.shots
        ? "Ball Winner"
        : "Progressor";

    return {
      ...p,
      score,
      role,
    };
  });

  rows.sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Recruitment Intelligence
          </p>

          <h1 className="page-title text-5xl font-black">
            Scout Dashboard
          </h1>

          <p className="mt-4 max-w-3xl text-slate-400">
            Automatische Spieleranalyse basierend auf Eventdaten,
            Aktionen und AI-Scores.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <Stat
            label="Tracked Players"
            value={rows.length.toString()}
          />

          <Stat
            label="Elite Players"
            value={rows.filter((r) => r.score > 150).length.toString()}
          />

          <Stat
            label="Total Events"
            value={events.length.toString()}
          />

          <Stat
            label="Scouted Teams"
            value={
              new Set(rows.map((r) => r.team)).size.toString()
            }
          />
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="overflow-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-white/5">
                <tr className="text-left text-sm text-slate-400">
                  <th className="p-4">Player</th>
                  <th>Team</th>
                  <th>Role</th>
                  <th>Score</th>
                  <th>Shots</th>
                  <th>Passes</th>
                  <th>Tackles</th>
                  <th>Carries</th>
                  <th>xG</th>
                </tr>
              </thead>

              <tbody>
                {rows.slice(0, 100).map((p) => (
                  <tr
                    key={p.player}
                    className="border-t border-white/5 hover:bg-white/[0.03]"
                  >
                    <td className="p-4 font-semibold">
                      <a
                        href={`/player-profile?player=${encodeURIComponent(
                          p.player
                        )}`}
                        className="hover:text-cyan-300"
                      >
                        {p.player}
                      </a>
                    </td>

                    <td>{p.team}</td>

                    <td>
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                        {p.role}
                      </span>
                    </td>

                    <td className="font-bold text-cyan-300">
                      {p.score}
                    </td>

                    <td>{p.shots}</td>
                    <td>{p.passes}</td>
                    <td>{p.tackles}</td>
                    <td>{p.carries}</td>
                    <td>{p.xg.toFixed(2)}</td>
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

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-4xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  );
}
