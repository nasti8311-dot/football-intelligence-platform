import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlayerRadarPage() {
  const events = await prisma.event.findMany({ take: 20000 });

  const map = new Map<string, any>();

  for (const e of events) {
    const player = e.player || "Unknown";
    if (!map.has(player)) {
      map.set(player, {
        player,
        team: e.team || "Unknown",
        events: 0,
        shots: 0,
        passes: 0,
        carries: 0,
        tackles: 0,
        xg: 0,
      });
    }

    const p = map.get(player);
    p.events++;
    if (e.eventType === "shot") {
      p.shots++;
      p.xg += Number(e.xg ?? 0);
    }
    if (e.eventType === "pass") p.passes++;
    if (e.eventType === "carry") p.carries++;
    if (e.eventType === "tackle") p.tackles++;
  }

  const players = [...map.values()]
    .map((p) => ({
      ...p,
      finishing: Math.min(100, Math.round(p.shots * 5 + p.xg * 25)),
      creation: Math.min(100, Math.round(p.passes * 0.8 + p.carries * 1.2)),
      progression: Math.min(100, Math.round(p.carries * 3 + p.passes * 0.4)),
      defending: Math.min(100, Math.round(p.tackles * 8)),
      score: Math.round(p.shots * 5 + p.xg * 25 + p.passes * 0.5 + p.carries),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Scouting Intelligence</p>
          <h1 className="text-5xl font-bold">Player Radar</h1>
          <p className="mt-3 text-slate-400">
            Spielerprofile aus Events: Finishing, Creation, Progression und Defending.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {players.map((p) => (
            <div key={p.player} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{p.player}</h2>
                  <p className="mt-1 text-sm text-slate-400">{p.team} · {p.events} events</p>
                </div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-sm text-emerald-300">
                  Score {p.score}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <Bar label="Finishing" value={p.finishing} />
                <Bar label="Creation" value={p.creation} />
                <Bar label="Progression" value={p.progression} />
                <Bar label="Defending" value={p.defending} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-cyan-300">{value}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
