import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamRadarPage() {
  const events = await prisma.event.findMany({ take: 20000 });

  const map = new Map<string, any>();

  for (const e of events) {
    const team = e.team || "Unknown";
    if (!map.has(team)) {
      map.set(team, {
        team,
        events: 0,
        shots: 0,
        passes: 0,
        carries: 0,
        tackles: 0,
        xg: 0,
      });
    }

    const t = map.get(team);
    t.events++;
    if (e.eventType === "shot") {
      t.shots++;
      t.xg += Number(e.xg ?? 0);
    }
    if (e.eventType === "pass") t.passes++;
    if (e.eventType === "carry") t.carries++;
    if (e.eventType === "tackle") t.tackles++;
  }

  const teams = [...map.values()]
    .map((t) => ({
      ...t,
      attack: Math.min(100, Math.round(t.shots * 3 + t.xg * 20)),
      possession: Math.min(100, Math.round(t.passes * 0.5)),
      tempo: Math.min(100, Math.round((t.passes + t.carries) * 0.35)),
      defending: Math.min(100, Math.round(t.tackles * 4)),
    }))
    .sort((a, b) => b.attack + b.possession - (a.attack + a.possession));

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Tactical Intelligence</p>
          <h1 className="text-5xl font-bold">Team Radar</h1>
          <p className="mt-3 text-slate-400">
            Teamprofile aus Eventdaten: Attack, Possession, Tempo und Defensive.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {teams.map((t) => (
            <div key={t.team} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t.team}</h2>
                <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-sm text-cyan-300">
                  {t.events} events
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <Bar label="Attack" value={t.attack} />
                <Bar label="Possession" value={t.possession} />
                <Bar label="Tempo" value={t.tempo} />
                <Bar label="Defending" value={t.defending} />
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
