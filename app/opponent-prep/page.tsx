import PageHero from "@/components/PageHero";
import TeamBadge from "@/components/TeamBadge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OpponentPrepPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const params = await searchParams;

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  const selected = params.team || teams[0]?.name || "";

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeam: { name: selected } },
        { awayTeam: { name: selected } },
        { homeTeamId: selected },
        { awayTeamId: selected },
      ],
    },
    take: 15,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  const events = await prisma.event.findMany({
    where: { team: selected },
    take: 5000,
  });

  const shots = events.filter((e) => e.eventType === "shot").length;
  const passes = events.filter((e) => e.eventType === "pass").length;
  const tackles = events.filter((e) => e.eventType === "tackle").length;
  const crosses = events.filter((e) => e.eventType === "cross").length;
  const xg = events.reduce((s, e) => s + Number(e.xg ?? 0), 0);

  let gf = 0;
  let ga = 0;

  for (const m of matches) {
    const home = m.homeTeam?.name || m.homeTeamId;
    const isHome = home === selected;

    gf += isHome ? Number(m.homeGoals ?? 0) : Number(m.awayGoals ?? 0);
    ga += isHome ? Number(m.awayGoals ?? 0) : Number(m.homeGoals ?? 0);
  }

  const threat =
    shots > 80 || xg > 20
      ? "High"
      : shots > 40 || xg > 10
      ? "Medium"
      : "Low";

  const weakness =
    ga > gf
      ? "Defensive transitions"
      : tackles < 20
      ? "Low defensive pressure"
      : passes < 200
      ? "Weak possession control"
      : "Few obvious weaknesses";

  const gamePlan =
    threat === "High"
      ? "Block central zones, reduce shot volume, force wide attacks."
      : passes > shots * 5
      ? "Press build-up early and disrupt possession rhythm."
      : "Control territory and attack quickly after turnovers.";

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero eyebrow="Opponent Intelligence" title="Opponent Prep" description="Gegneranalyse mit Schwächen, Bedrohung und Matchplan." />

        <section className="flex max-h-44 flex-wrap gap-2 overflow-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          {teams.slice(0, 60).map((t) => (
            <a
              key={t.id}
              href={`/opponent-prep?team=${encodeURIComponent(t.name)}`}
              className={`rounded-xl px-4 py-2 text-sm ${
                selected === t.name
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {t.name}
            </a>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm text-cyan-300">Selected Opponent</p>
          <h2 className="mt-2 text-5xl font-black">{selected}</h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Big label="Threat Level" value={threat} />
            <Big label="Main Weakness" value={weakness} />
            <Big label="Game Plan" value={gamePlan} />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-5">
          <Card title="Shots" value={shots.toString()} />
          <Card title="Passes" value={passes.toString()} />
          <Card title="Tackles" value={tackles.toString()} />
          <Card title="Crosses" value={crosses.toString()} />
          <Card title="xG" value={xg.toFixed(2)} />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-3xl font-bold">Recent Match Context</h2>

          <div className="mt-5 space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-2xl bg-slate-900 p-4">
                <div>
                  <p className="text-sm text-cyan-300">{m.league?.name ?? "League"}</p>
                  <p className="font-bold">
                    {m.homeTeam?.name ?? m.homeTeamId} vs {m.awayTeam?.name ?? m.awayTeamId}
                  </p>
                </div>

                <p className="text-2xl font-black text-cyan-300">
                  {m.homeGoals ?? "-"}:{m.awayGoals ?? "-"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Big({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-black text-cyan-300">{value}</p>
    </div>
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
