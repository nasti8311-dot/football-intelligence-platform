import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ActionCenterPage() {
  const [matches, teams, events] = await Promise.all([
    prisma.match.count(),
    prisma.team.count(),
    prisma.event.count(),
  ]);

  const dataHealth =
    events > 10000 && matches > 100
      ? "Strong"
      : events > 1000
      ? "Good"
      : "Needs more data";

  const actions = [
    {
      title: "Analyse strongest teams",
      desc: "See which clubs are performing best across goals, points and form.",
      href: "/team-intelligence",
      priority: "High",
    },
    {
      title: "Review scouting targets",
      desc: "Open AI-generated player reports and identify interesting profiles.",
      href: "/ai-scout-report",
      priority: "High",
    },
    {
      title: "Check match predictions",
      desc: "Review probability estimates and confidence scores for matches.",
      href: "/prediction-center",
      priority: "Medium",
    },
    {
      title: "Improve data quality",
      desc: "Upload richer event data with player, team, x/y and xG fields.",
      href: "/upload-center",
      priority: "Medium",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Decision Support</p>
          <h1 className="text-5xl font-black">Action Center</h1>
          <p className="mt-4 max-w-3xl text-slate-400">
            Klare nächste Schritte aus deinen Football-Daten — für Analysten,
            Scouts und Entscheider.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Card title="Data Health" value={dataHealth} />
          <Card title="Matches" value={matches.toString()} />
          <Card title="Events" value={events.toString()} />
        </section>

        <section className="grid gap-5">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-cyan-400/40 hover:bg-white/[0.07]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-cyan-300">{a.priority} Priority</p>
                  <h2 className="mt-1 text-3xl font-bold">{a.title}</h2>
                  <p className="mt-3 max-w-3xl text-slate-400">{a.desc}</p>
                </div>

                <div className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
                  Open →
                </div>
              </div>
            </Link>
          ))}
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
