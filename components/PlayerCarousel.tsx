import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PlayerCarousel() {
  const events = await prisma.event.findMany({
    take: 12000,
  });

  const map = new Map();

  for (const e of events) {
    if (!e.player) continue;

    if (!map.has(e.player)) {
      map.set(e.player, {
        player: e.player,
        team: e.team || "Unknown",
        score: 0,
      });
    }

    const p = map.get(e.player);

    if (e.eventType === "shot") p.score += 5;
    if (e.eventType === "pass") p.score += 1;
    if (e.eventType === "tackle") p.score += 2;

    p.score += Number(e.xg ?? 0) * 20;
  }

  const players = [...map.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <p className="text-sm text-cyan-300">
          Elite Players
        </p>

        <h2 className="mt-1 text-3xl font-black">
          Trending Players
        </h2>
      </div>

      <div className="flex gap-5 overflow-auto pb-2">
        {players.map((p, i) => (
          <Link
            key={p.player}
            href={`/player-profile?player=${encodeURIComponent(p.player)}`}
            className="min-w-[240px] rounded-3xl bg-slate-950/60 p-5 transition hover:scale-[1.03]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 text-2xl font-black text-slate-950">
              #{i + 1}
            </div>

            <h3 className="mt-5 text-2xl font-black">
              {p.player}
            </h3>

            <p className="mt-2 text-slate-400">
              {p.team}
            </p>

            <p className="mt-6 text-4xl font-black text-cyan-300">
              {Math.round(p.score)}
            </p>

            <p className="text-xs text-slate-500">
              AI Score
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
