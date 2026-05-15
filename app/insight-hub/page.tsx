import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InsightHubPage() {
  const [matches, teams, events, leagues] = await Promise.all([
    prisma.match.count(),
    prisma.team.count(),
    prisma.event.count(),
    prisma.league.count(),
  ]);

  const insights = [
    {
      title: "Team Performance",
      status: teams > 20 ? "Ready" : "Needs more teams",
      desc: "Vergleiche Teams nach Form, Toren, Punkten und Spielstil.",
      href: "/team-intelligence",
    },
    {
      title: "Player Scouting",
      status: events > 5000 ? "Ready" : "Needs event data",
      desc: "Finde auffällige Spielerprofile aus Aktionen und Scores.",
      href: "/ai-scout-report",
    },
    {
      title: "Match Predictions",
      status: matches > 100 ? "Ready" : "Needs more matches",
      desc: "Bewerte Spiele mit Wahrscheinlichkeiten und Confidence.",
      href: "/prediction-center",
    },
    {
      title: "Visual Event Analysis",
      status: events > 1000 ? "Ready" : "Needs event data",
      desc: "Sieh Schüsse, Pässe und Aktionen direkt auf dem Spielfeld.",
      href: "/event-map",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Simple Intelligence</p>
          <h1 className="text-5xl font-black">Insight Hub</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Der einfachste Einstieg: Was kann die Plattform aktuell analysieren?
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <Card label="Matches" value={matches} />
          <Card label="Teams" value={teams} />
          <Card label="Events" value={events} />
          <Card label="Leagues" value={leagues} />
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {insights.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:border-cyan-400/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">{item.title}</h2>
                  <p className="mt-3 text-slate-400">{item.desc}</p>
                </div>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-300">
                  {item.status}
                </span>
              </div>

              <div className="mt-6 text-sm font-bold text-cyan-300">
                Open insight →
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
