import { prisma } from "@/lib/prisma";

type Player = {
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

function classifyRole(p: Player) {
  if (p.shotShare > 0.35 && p.xg > 0.25) return "Finisher";
  if (p.passShare > 0.65) return "Progressor";
  if (p.pressureShare > 0.35) return "Presser";
  if (p.passes > p.shots && p.pressures > 0) return "Two-Way";
  return "Generalist";
}

function similarity(a: Player, b: Player) {
  const diff =
    Math.abs(a.passShare - b.passShare) +
    Math.abs(a.shotShare - b.shotShare) +
    Math.abs(a.pressureShare - b.pressureShare) +
    Math.abs(a.xg - b.xg);

  return Math.max(0, 100 - diff * 100);
}

function fitScore(p: Player) {
  const roleBonus =
    p.role === "Progressor" ? 12 :
    p.role === "Finisher" ? 10 :
    p.role === "Two-Way" ? 9 :
    p.role === "Presser" ? 8 : 5;

  return p.intelligence + roleBonus + p.events * 0.2;
}

export default async function RecruitmentPage() {
  const events = await prisma.event.findMany({
    where: { player: { not: null } },
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
        passShare: 0,
        shotShare: 0,
        pressureShare: 0,
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
    if (e.eventType === "pass") p.passes += 1;
    if (e.eventType === "pressure") p.pressures += 1;
  }

  const players = [...map.values()]
    .map((p) => {
      const total = Math.max(1, p.events);
      const enriched = {
        ...p,
        passShare: p.passes / total,
        shotShare: p.shots / total,
        pressureShare: p.pressures / total,
        intelligence:
          p.xg * 25 +
          p.passes * 0.4 +
          p.pressures * 0.7 +
          p.shots * 1.5,
      };

      return {
        ...enriched,
        role: classifyRole(enriched),
      };
    })
    .sort((a, b) => fitScore(b) - fitScore(a));

  const reference = players[0];
  const replacements = reference
    ? players
        .filter((p) => p.name !== reference.name)
        .map((p) => ({
          ...p,
          similarity: similarity(reference, p),
          squadFit: fitScore(p),
        }))
        .sort((a, b) => b.squadFit + b.similarity - (a.squadFit + a.similarity))
        .slice(0, 8)
    : [];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Recruitment Intelligence</p>
          <h1 className="text-4xl font-bold">Recruitment AI</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Replacement Finder, Squad-Fit Score und Style Compatibility auf Basis
            deiner Eventdaten.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Kpi title="Players" value={players.length.toString()} />
          <Kpi title="Reference" value={reference?.name ?? "—"} />
          <Kpi title="Role" value={reference?.role ?? "—"} />
          <Kpi
            title="Best Fit"
            value={reference ? fitScore(reference).toFixed(1) : "—"}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Reference Profile">
            {reference ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{reference.name}</h3>
                <p className="text-slate-400">
                  {reference.team} · {reference.role}
                </p>
                <Metric label="Intelligence" value={reference.intelligence} />
                <Metric label="Squad Fit" value={fitScore(reference)} />
                <Metric label="xG" value={reference.xg} />
              </div>
            ) : (
              <p className="text-slate-400">Keine Spielerdaten vorhanden.</p>
            )}
          </Panel>

          <Panel title="Replacement Finder">
            <div className="space-y-3">
              {replacements.map((p) => (
                <div key={p.name} className="rounded-2xl bg-slate-900 p-4">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-slate-400">
                        {p.team} · {p.role}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cyan-300">
                        {p.similarity.toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-400">Similarity</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-emerald-300">
                    Squad Fit: {p.squadFit.toFixed(1)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <Panel title="Recruitment Shortlist">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Events</th>
                  <th className="p-3">xG</th>
                  <th className="p-3">IQ</th>
                  <th className="p-3">Squad Fit</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.name} className="border-t border-white/10">
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3">{p.team}</td>
                    <td className="p-3 text-cyan-300">{p.role}</td>
                    <td className="p-3">{p.events}</td>
                    <td className="p-3">{p.xg.toFixed(2)}</td>
                    <td className="p-3 text-emerald-300">
                      {p.intelligence.toFixed(1)}
                    </td>
                    <td className="p-3 font-bold text-purple-300">
                      {fitScore(p).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-cyan-400"
          style={{ width: `${Math.min(100, value * 4)}%` }}
        />
      </div>
    </div>
  );
}