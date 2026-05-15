import TrustBar from "@/components/TrustBar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    matches,
    teams,
    events,
    leagues,
  ] = await Promise.all([
    prisma.match.count(),
    prisma.team.count(),
    prisma.event.count(),
    prisma.league.count(),
  ]);

  const recentMatches = await prisma.match.findMany({
    take: 8,
    orderBy: {
      kickoff: "desc",
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  });

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">

        <section>
          <p className="text-sm text-cyan-400">
            Overview
          </p>

          <h1 className="mt-2 page-title text-5xl font-black">
            Football Dashboard
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Übersicht über Teams, Spiele, Events und aktuelle Matchdaten.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Matches" value={matches.toString()} />
          <Card title="Teams" value={teams.toString()} />
          <Card title="Events" value={events.toString()} />
          <Card title="Leagues" value={leagues.toString()} />
        </section>

        <section className="grid gap-5 xl:grid-cols-3">

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-400">
                  Match Feed
                </p>

                <h2 className="text-3xl font-bold">
                  Recent Matches
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {recentMatches.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
                >
                  <div>
                    <p className="text-sm text-cyan-300">
                      {m.league?.name ?? "League"}
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                      {m.homeTeam?.name ?? m.homeTeamId}
                      {" vs "}
                      {m.awayTeam?.name ?? m.awayTeamId}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {m.kickoff
                        ? new Date(m.kickoff).toLocaleDateString("de-DE")
                        : "No Date"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-black text-cyan-300">
                      {m.homeGoals ?? "-"}:{m.awayGoals ?? "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <QuickLink
              href="/team-intelligence"
              title="Team Analysis"
              desc="Taktik, Form und Tabellen"
            />

            <QuickLink
              href="/ai-scout-report"
              title="Scout Reports"
              desc="AI-basierte Spieleranalyse"
            />

            <QuickLink
              href="/prediction-center"
              title="Predictions"
              desc="Wahrscheinlichkeiten & Modelle"
            />

            <QuickLink
              href="/event-map"
              title="Event Map"
              desc="Visualisierte Eventdaten"
            />
          </div>
        </section>
              <TrustBar />
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="glass-card rounded-3xl p-6">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-3 page-title text-5xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-400/40 hover:bg-white/[0.06]"
    >
      <p className="text-2xl font-bold">
        {title}
      </p>

      <p className="mt-2 text-slate-400">
        {desc}
      </p>

      <div className="mt-5 text-sm font-semibold text-cyan-300">
        Open →
      </div>
    </a>
  );
}
