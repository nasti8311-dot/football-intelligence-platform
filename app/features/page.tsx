import Link from "next/link";
import PageHero from "@/components/PageHero";

const features = [
  ["Team Intelligence", "Team strength, form, goals and tactical profiles.", "/team-intelligence"],
  ["Scout Dashboard", "Player rankings, role detection and AI scores.", "/scout-dashboard"],
  ["Match Center", "Single-match view with score, event map and activity.", "/match-center"],
  ["Opponent Prep", "Opponent weaknesses, threats and game-plan suggestions.", "/opponent-prep"],
  ["Transfer Market", "AI-generated player value and recruitment profiles.", "/transfer-market"],
  ["Data Health", "Check whether your football data is good enough.", "/data-health"],
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Platform Features"
          title="Everything for Football Analysis"
          description="Explore the main tools inside the Football Intelligence Platform."
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map(([title, desc, href]) => (
            <Link key={href} href={href} className="glass-card rounded-3xl p-8 transition hover:scale-[1.02]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-3xl">
                ⚽
              </div>

              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-4 text-slate-300">{desc}</p>
              <p className="mt-6 font-bold text-cyan-300">Open feature →</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
