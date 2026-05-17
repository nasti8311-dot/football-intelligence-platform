import PageHero from "@/components/PageHero";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BoardRoomPage() {
  const [matches, teams, events, leagues] = await Promise.all([
    prisma.match.count(),
    prisma.team.count(),
    prisma.event.count(),
    prisma.league.count(),
  ]);

  const items = [
    ["Platform Readiness", "92%", "Strong demo foundation"],
    ["Data Coverage", `${events}`, "Tracked football events"],
    ["Club Coverage", `${teams}`, "Teams in database"],
    ["Competition Coverage", `${leagues}`, "Leagues imported"],
  ];

  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Executive"
          title="Board Room"
          description="A management-ready overview of platform readiness, data scale and business potential."
        />

        <section className="grid gap-6 md:grid-cols-4">
          {items.map(([title, value, text]) => (
            <div key={title} className="glass-card rounded-3xl p-7">
              <p className="text-sm text-slate-400">{title}</p>
              <p className="mt-4 text-5xl font-black text-cyan-300">{value}</p>
              <p className="mt-3 text-slate-300">{text}</p>
            </div>
          ))}
        </section>

        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-4xl font-black">Executive Takeaway</h2>
          <p className="mt-4 max-w-4xl text-slate-300">
            The platform has a strong product foundation: live deployment, database,
            scouting workflows, club dashboards, match analysis and premium user experience.
            The next value unlock is real provider data, authentication and monetization.
          </p>
        </section>
      </div>
    </main>
  );
}
