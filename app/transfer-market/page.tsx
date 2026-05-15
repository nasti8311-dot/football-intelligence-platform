import { prisma } from "@/lib/prisma";
import TeamBadge from "@/components/TeamBadge";
import PageHero from "@/components/PageHero";

export const dynamic = "force-dynamic";

export default async function TransferMarketPage() {
  const events = await prisma.event.findMany({
    take: 20000,
  });

  const players = new Map();

  for (const e of events) {
    if (!e.player) continue;

    if (!players.has(e.player)) {
      players.set(e.player, {
        player: e.player,
        team: e.team || "Unknown",
        shots: 0,
        passes: 0,
        tackles: 0,
        xg: 0,
      });
    }

    const p = players.get(e.player);

    if (e.eventType === "shot") p.shots++;
    if (e.eventType === "pass") p.passes++;
    if (e.eventType === "tackle") p.tackles++;

    p.xg += Number(e.xg ?? 0);
  }

  const rows = [...players.values()]
    .map((p: any) => ({
      ...p,
      score: Math.round(
        p.shots * 5 +
        p.passes * 0.4 +
        p.tackles * 2 +
        p.xg * 30
      ),
      value: Math.round(
        (
          p.shots * 1200000 +
          p.passes * 80000 +
          p.tackles * 150000 +
          p.xg * 5000000
        ) / 1000000
      ),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 40);

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">

        <PageHero
          eyebrow="Recruitment Market"
          title="Transfer Market"
          description="AI-basierte Marktwerte, Spieler-Rankings und Transferkandidaten."
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p: any, i: number) => (
            <div
              key={p.player}
              className="glass-card rounded-3xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <TeamBadge
                    team={p.team}
                    size={58}
                  />

                  <div>
                    <h2 className="text-2xl font-black">
                      {p.player}
                    </h2>

                    <p className="text-slate-400">
                      {p.team}
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-cyan-400/10 px-4 py-2 text-cyan-300">
                  #{i + 1}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <MiniStat
                  label="AI Score"
                  value={p.score}
                />

                <MiniStat
                  label="Market Value"
                  value={`€${p.value}M`}
                />

                <MiniStat
                  label="Shots"
                  value={p.shots}
                />

                <MiniStat
                  label="xG"
                  value={p.xg.toFixed(2)}
                />
              </div>

              <a
                href={`/player-profile?player=${encodeURIComponent(
                  p.player
                )}`}
                className="mt-6 block rounded-2xl bg-cyan-400 px-5 py-4 text-center font-bold text-slate-950"
              >
                Open Profile
              </a>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  );
}
