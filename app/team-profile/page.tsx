import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TeamProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const params = await searchParams;
  const selectedTeam = params.team;

  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  const teamName = selectedTeam || teams[0]?.name || "";

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeam: { name: teamName } },
        { awayTeam: { name: teamName } },
        { homeTeamId: teamName },
        { awayTeamId: teamName },
      ],
    },
    take: 20,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let gf = 0;
  let ga = 0;

  for (const m of matches) {
    const homeName = m.homeTeam?.name || m.homeTeamId;
    const awayName = m.awayTeam?.name || m.awayTeamId;
    const isHome = homeName === teamName;

    const goalsFor = isHome
      ? Number(m.homeGoals ?? 0)
      : Number(m.awayGoals ?? 0);

    const goalsAgainst = isHome
      ? Number(m.awayGoals ?? 0)
      : Number(m.homeGoals ?? 0);

    gf += goalsFor;
    ga += goalsAgainst;

    if (goalsFor > goalsAgainst) wins++;
    else if (goalsFor < goalsAgainst) losses++;
    else draws++;
  }

  const events = await prisma.event.findMany({
    where: { team: teamName },
    take: 5000,
  });

  const shots = events.filter((e) => e.eventType === "shot").length;
  const passes = events.filter((e) => e.eventType === "pass").length;
  const tackles = events.filter((e) => e.eventType === "tackle").length;
  const xg = events.reduce((sum, e) => sum + Number(e.xg ?? 0), 0);

  const style =
    shots > passes * 0.25
      ? "Direct attacking"
      : passes > shots * 5
      ? "Possession focused"
      : tackles > shots
      ? "Aggressive defensive"
      : "Balanced";

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Team Deep Dive</p>
          <h1 className="text-5xl font-black">Team Profile</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Wähle ein Team und sieh sofort Form, Tore, Events, Spielstil und letzte Spiele.
          </p>
        </section>

        <section className="flex flex-wrap gap-2">
          {teams.slice(0, 40).map((t) => (
            <a
              key={t.id}
              href={`/team-profile?team=${encodeURIComponent(t.name)}`}
              className={`rounded-xl px-4 py-2 text-sm ${
                teamName === t.name
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              {t.name}
            </a>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm text-cyan-300">Selected Team</p>
          <h2 className="mt-2 text-5xl font-black">
            {teamName || "No team selected"}
          </h2>
          <p className="mt-4 text-slate-400">
            Style: <span className="text-cyan-300">{style}</span>
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-4">
            <Card title="Wins" value={wins.toString()} />
            <Card title="Draws" value={draws.toString()} />
            <Card title="Losses" value={losses.toString()} />
            <Card title="Goals" value={`${gf}:${ga}`} />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <Card title="Events" value={events.length.toString()} />
          <Card title="Shots" value={shots.toString()} />
          <Card title="Passes" value={passes.toString()} />
          <Card title="xG" value={xg.toFixed(2)} />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-3xl font-bold">Recent Matches</h2>

          <div className="mt-5 space-y-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
              >
                <div>
                  <p className="text-sm text-cyan-300">
                    {m.league?.name ?? "League"}
                  </p>
                  <p className="font-bold">
                    {m.homeTeam?.name ?? m.homeTeamId} vs{" "}
                    {m.awayTeam?.name ?? m.awayTeamId}
                  </p>
                </div>

                <p className="text-2xl font-black text-cyan-300">
                  {m.homeGoals ?? "-"}:{m.awayGoals ?? "-"}
                </p>
              </div>
            ))}

            {matches.length === 0 && (
              <p className="rounded-2xl bg-slate-900 p-4 text-slate-400">
                Keine Matches für dieses Team gefunden.
              </p>
            )}
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
