import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ player?: string }>;
}) {
  const params = await searchParams;
  const selectedPlayer = params.player;

  const playerRows = await prisma.event.findMany({
    distinct: ["player"],
    select: { player: true },
    where: {
      player: {
        not: null,
      },
    },
    take: 80,
    orderBy: { player: "asc" },
  });

  const playerName = selectedPlayer || playerRows[0]?.player || "";

  const events = await prisma.event.findMany({
    where: { player: playerName },
    take: 5000,
    orderBy: { minute: "asc" },
  });

  const shots = events.filter((e) => e.eventType === "shot").length;
  const passes = events.filter((e) => e.eventType === "pass").length;
  const carries = events.filter((e) => e.eventType === "carry").length;
  const tackles = events.filter((e) => e.eventType === "tackle").length;
  const xg = events.reduce((sum, e) => sum + Number(e.xg ?? 0), 0);

  const team = events[0]?.team ?? "Unknown";

  const role =
    shots > passes * 0.25
      ? "Finisher"
      : passes > carries
      ? "Playmaker"
      : tackles > shots
      ? "Ball Winner"
      : "Progressor";

  const score = Math.round(
    xg * 25 + shots * 4 + passes * 0.5 + carries * 1.2 + tackles * 2
  );

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Player Deep Dive</p>
          <h1 className="text-5xl font-black">Player Profile</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Wähle einen Spieler und sieh Rolle, Score, Aktionen und Scouting-Profil.
          </p>
        </section>

        <section className="flex max-h-52 flex-wrap gap-2 overflow-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          {playerRows.map((p) =>
            p.player ? (
              <a
                key={p.player}
                href={`/player-profile?player=${encodeURIComponent(p.player)}`}
                className={`rounded-xl px-4 py-2 text-sm ${
                  playerName === p.player
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-white/10 text-slate-300 hover:bg-white/20"
                }`}
              >
                {p.player}
              </a>
            ) : null
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm text-cyan-300">{team}</p>
          <h2 className="mt-2 text-5xl font-black">
            {playerName || "No player selected"}
          </h2>
          <p className="mt-4 text-slate-400">
            Role: <span className="text-cyan-300">{role}</span> · AI Score:{" "}
            <span className="text-emerald-300">{score}</span>
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <Card title="Events" value={events.length.toString()} />
            <Card title="Shots" value={shots.toString()} />
            <Card title="Passes" value={passes.toString()} />
            <Card title="xG" value={xg.toFixed(2)} />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <Metric label="Finishing" value={Math.min(100, Math.round(shots * 5 + xg * 25))} />
          <Metric label="Creation" value={Math.min(100, Math.round(passes * 0.8))} />
          <Metric label="Progression" value={Math.min(100, Math.round(carries * 5 + passes * 0.3))} />
          <Metric label="Defending" value={Math.min(100, Math.round(tackles * 8))} />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-3xl font-bold">Recent Actions</h2>

          <div className="mt-5 space-y-3">
            {events.slice(0, 20).map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
              >
                <div>
                  <p className="text-sm text-cyan-300">
                    Minute {e.minute}
                  </p>
                  <p className="font-bold">
                    {e.eventType} · {e.team ?? "Unknown Team"}
                  </p>
                </div>

                <p className="text-sm text-slate-400">
                  xG {Number(e.xg ?? 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-4xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-cyan-300">{value}</span>
      </div>
      <div className="mt-4 h-3 rounded-full bg-slate-800">
        <div className="h-3 rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
