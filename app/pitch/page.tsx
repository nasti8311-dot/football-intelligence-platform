import Link from "next/link";
import PageHero from "@/components/PageHero";

const points = [
  ["Problem", "Football clubs have fragmented data, complex tools and expensive provider ecosystems."],
  ["Solution", "A simple AI-powered football intelligence cockpit for scouting, coaching and match analysis."],
  ["Product", "Dashboards, reports, player profiles, opponent prep, transfer market and event maps."],
  ["Market", "Clubs, academies, scouts, agencies, analysts and semi-professional teams."],
  ["Business Model", "Monthly SaaS subscriptions, club plans, white-label reports and data integrations."],
  ["Next Step", "Connect real event feeds, add user accounts, billing and automated report exports."],
];

export default function PitchPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Business"
          title="Investor Pitch"
          description="A concise business overview of the Football Intelligence Platform."
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {points.map(([title, text]) => (
            <div key={title} className="glass-card rounded-3xl p-8">
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-4 text-slate-300">{text}</p>
            </div>
          ))}
        </section>

        <section className="glass-card rounded-3xl p-8">
          <h2 className="text-4xl font-black">Demo Ready</h2>
          <p className="mt-4 max-w-3xl text-slate-300">
            The platform already includes deployment, database, navigation, analytics pages,
            scouting workflows and premium UI components.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/demo-tour" className="rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950">
              Open Demo Tour
            </Link>

            <Link href="/reports-center" className="rounded-2xl bg-white/10 px-6 py-4 font-bold text-white">
              View Reports
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
