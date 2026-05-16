import Link from "next/link";
import PageHero from "@/components/PageHero";

const portals = [
  ["Club Portal", "Team reports, form guide, opponent prep and match center.", "/club-house"],
  ["Scout Portal", "Scout dashboard, transfer market and player profiles.", "/scout-dashboard"],
  ["Analyst Portal", "Event maps, team intelligence and data health.", "/event-map"],
  ["Executive Portal", "Summary, pricing, pitch and case studies.", "/executive-summary"],
];

export default function ClientPortalPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Client Access"
          title="Client Portal"
          description="A clean starting point for different user types inside the platform."
        />

        <section className="grid gap-6 md:grid-cols-2">
          {portals.map(([title, text, href]) => (
            <Link key={title} href={href} className="glass-card rounded-3xl p-8 transition hover:scale-[1.02]">
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="mt-4 text-slate-300">{text}</p>
              <p className="mt-6 font-bold text-cyan-300">Enter portal →</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
