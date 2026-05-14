import { prisma } from "@/lib/prisma";

type TeamStyle = {
  team: string;
  events: number;
  shots: number;
  passes: number;
  pressures: number;
  xg: number;
  directness: number;
  pressing: number;
  possession: number;
  attackingThreat: number;
  style: string;
};

function classify(t: TeamStyle) {
  if (t.pressing > 35 && t.directness > 25) return "Aggressive Press & Direct";
  if (t.possession > 65) return "Possession Dominant";
  if (t.attackingThreat > 30) return "Chance Creation Focused";
  if (t.pressing > 30) return "High Pressing";
  if (t.directness > 30) return "Direct Transition";
  return "Balanced";
}

export default async function TeamStylePage() {
  const events = await prisma.event.findMany();

  const map = new Map<string, TeamStyle>();

  for (const e of events) {
    if (!map.has(e.team)) {
      map.set(e.team, {
        team: e.team,
        events: 0,
        shots: 0,
        passes: 0,
        pressures: 0,
        xg: 0,
        directness: 0,
        pressing: 0,
        possession: 0,
        attackingThreat: 0,
        style: "Balanced",
      });
    }

    const t = map.get(e.team)!;
    t.events++;

    if (e.eventType === "shot") {
      t.shots++;
      t.xg += Number(e.xg ?? 0);
    }

    if (e.eventType === "pass") {
      t.passes++;
      if (e.x != null && e.endX != null && e.endX - e.x >= 20) {
        t.directness++;
      }
    }

    if (e.eventType === "pressure") {
      t.pressures++;
    }
  }

  const teams = [...map.values()]
    .map((t) => {
      const total = Math.max(1, t.events);
      const enriched = {
        ...t,
        directness: Number(((t.directness / total) * 100).toFixed(1)),
        pressing: Number(((t.pressures / total) * 100).toFixed(1)),
        possession: Number(((t.passes / total) * 100).toFixed(1)),
        attackingThreat: Number(((t.shots + t.xg * 3) / total * 100).toFixed(1)),
      };

      return {
        ...enriched,
        style: classify(enriched),
      };
    })
    .sort((a, b) => b.attackingThreat - a.attackingThreat);

  const best = teams[0];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Team Intelligence</p>
          <h1 className="text-5xl font-bold">Team Style Intelligence</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Automatische Spielstil-Erkennung aus Eventdaten: Pressing,
            Ballbesitz, Direktheit und offensive Gefahr.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card title="Teams" value={teams.length.toString()} />
          <Card title="Top Threat" value={best?.team ?? "—"} />
          <Card title="Top Style" value={best?.style ?? "—"} />
          <Card
            title="Threat Score"
            value={best ? best.attackingThreat.toFixed(1) : "—"}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {teams.map((t) => (
            <section
              key={t.team}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{t.team}</h2>
                  <p className="mt-1 text-cyan-300">{t.style}</p>
                </div>
                <div className="rounded-2xl bg-cyan-400/10 px-4 py-2 text-cyan-300">
                  {t.attackingThreat.toFixed(1)}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Bar label="Possession" value={t.possession} />
                <Bar label="Pressing" value={t.pressing} />
                <Bar label="Directness" value={t.directness} />
                <Bar label="Attacking Threat" value={t.attackingThreat} />
              </div>

              <div className="mt-6 grid grid-cols-4 gap-2 text-xs">
                <Mini label="Shots" value={t.shots} />
                <Mini label="Passes" value={t.passes} />
                <Mini label="Pressures" value={t.pressures} />
                <Mini label="xG" value={Number(t.xg.toFixed(2))} />
              </div>
            </section>
          ))}
        </section>

        {teams.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-slate-400">
            Noch keine Eventdaten vorhanden. Importiere zuerst Events unter /admin/events.
          </section>
        )}
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 truncate text-2xl font-bold">{value}</p>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-cyan-300">{value.toFixed(1)}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-cyan-400"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-900 p-3 text-center">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
