import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExecutiveSummaryPage() {
  const [matches, teams, events, leagues] = await Promise.all([
    prisma.match.count(),
    prisma.team.count(),
    prisma.event.count(),
    prisma.league.count(),
  ]);

  const latestMatches = await prisma.match.findMany({
    take: 5,
    orderBy: { kickoff: "desc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Simple Overview</p>
          <h1 className="text-5xl font-black">Executive Summary</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Ein einfacher Überblick über den aktuellen Stand deiner Football-Datenplattform.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <Card title="Analysierte Spiele" value={matches} />
          <Card title="Teams" value={teams} />
          <Card title="Events" value={events} />
          <Card title="Ligen" value={leagues} />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-3xl font-bold">Was bedeutet das?</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <Info
              title="Daten sind geladen"
              text="Die Plattform hat Match- und Eventdaten verarbeitet und kann daraus Analysen berechnen."
            />
            <Info
              title="Teams werden bewertet"
              text="Form, Tore, Gegentore und Performance werden zu einfachen Teamprofilen zusammengefasst."
            />
            <Info
              title="Scouting ist aktiv"
              text="Spieleraktionen werden zu Scores und Scout Reports verdichtet."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-3xl font-bold">Aktuelle Spiele</h2>

          <div className="mt-5 space-y-3">
            {latestMatches.map((m) => (
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
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-5xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-slate-400">{text}</p>
    </div>
  );
}
