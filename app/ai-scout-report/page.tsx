import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AIScoutReportPage() {
  const events = await prisma.event.findMany({ take: 20000 });

  const players = new Map<string, any>();

  for (const e of events) {
    const player = e.player || "Unknown";
    if (!players.has(player)) {
      players.set(player, {
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

    const p = players.get(player);
    p.events++;
    if (e.eventType === "shot") {
      p.shots++;
      p.xg += Number(e.xg ?? 0);
    }
    if (e.eventType === "pass") p.passes++;
    if (e.eventType === "carry") p.carries++;
    if (e.eventType === "tackle") p.tackles++;
  }

  const reports = [...players.values()]
    .map((p) => {
      const score = Math.round(
        p.xg * 30 + p.shots * 5 + p.passes * 0.5 + p.carries * 1.2 + p.tackles * 2
      );

      const role =
        p.shots > p.passes * 0.25
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
        recommendation:
          score > 80
            ? "High priority scouting target"
            : score > 50
            ? "Monitor closely"
            : "Depth profile / development watch",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">AI Scouting</p>
          <h1 className="text-5xl font-bold">AI Scout Reports</h1>
          <p className="mt-3 text-slate-400">
            Automatisch generierte Spielerprofile mit Rolle, Score und Empfehlung.
          </p>
        </section>

        <section className="grid gap-5">
          {reports.map((p) => (
            <div key={p.player} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-cyan-300">{p.team}</p>
                  <h2 className="mt-1 text-2xl font-bold">{p.player}</h2>
                  <p className="mt-2 text-slate-400">
                    Role: {p.role} · Events: {p.events} · xG: {p.xg.toFixed(2)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-400">AI Score</p>
                  <p className="text-4xl font-black text-emerald-300">{p.score}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Scout Recommendation</p>
                <p className="mt-2 text-lg font-semibold text-white">{p.recommendation}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
