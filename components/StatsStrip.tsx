import { prisma } from "@/lib/prisma";

export default async function StatsStrip() {
  const [matches, teams, events, leagues] = await Promise.all([
    prisma.match.count(),
    prisma.team.count(),
    prisma.event.count(),
    prisma.league.count(),
  ]);

  const stats = [
    ["Matches", matches],
    ["Teams", teams],
    ["Events", events],
    ["Leagues", leagues],
  ];

  return (
    <section className="glass-card overflow-hidden rounded-3xl">
      <div className="grid md:grid-cols-4">
        {stats.map(([label, value], i) => (
          <div
            key={label}
            className={`relative p-8 ${
              i !== stats.length - 1
                ? "border-b border-white/10 md:border-b-0 md:border-r"
                : ""
            }`}
          >
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />

            <p className="relative text-sm uppercase tracking-[0.2em] text-slate-500">
              {label}
            </p>

            <p className="relative mt-4 text-6xl font-black text-cyan-300">
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
