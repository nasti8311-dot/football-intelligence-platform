import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TopPlayers() {
  const events = await prisma.event.findMany({
    take: 20000,
  });

  const map = new Map();

  for (const e of events) {
    if (!e.player) continue;

    if (!map.has(e.player)) {
      map.set(e.player, {
        player: e.player,
        team: e.team || "Unknown",
        shots: 0,
        passes: 0,
        tackles: 0,
        xg: 0,
      });
    }

    const p = map.get(e.player);

    if (e.eventType === "shot") p.shots++;
    if (e.eventType === "pass") p.passes++;
    if (e.eventType === "tackle") p.tackles++;

    p.xg += Number(e.xg ?? 0);
  }

  const rows = [...map.values()]
    .map((p: any) => ({
      ...p,
      score: Math.round(
        p.shots * 5 +
        p.passes * 0.4 +
        p.tackles * 2 +
        p.xg * 30
      ),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-cyan-300">
            Recruitment Intelligence
          </p>

          <h2 className="mt-1 text-3xl font-black">
            Top Players
          </h2>
        </div>

        <Link
          href="/scout-dashboard"
          className="rounded-2xl bg-cyan-400 px-4 py-2 font-bold text-slate-950"
        >
          Open Scout
        </Link>
      </div>

      <div className="space-y-4">
        {rows.map((p: any, i: number) => (
          <Link
            key={p.player}
            href={`/player-profile?player=${encodeURIComponent(p.player)}`}
            className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-4 transition hover:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 font-black text-slate-950">
                #{i + 1}
              </div>

              <div>
                <p className="font-bold">
                  {p.player}
                </p>

                <p className="text-sm text-slate-400">
                  {p.team}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-cyan-300">
                {p.score}
              </p>

              <p className="text-xs text-slate-500">
                AI Score
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
