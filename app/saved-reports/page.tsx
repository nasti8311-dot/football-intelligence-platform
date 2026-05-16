import Link from "next/link";
import PageHero from "@/components/PageHero";

const reports = [
  ["Weekly Club Report", "Team Intelligence + Coach View", "/team-intelligence"],
  ["Recruitment Shortlist", "Scout Dashboard + Transfer Market", "/transfer-market"],
  ["Opponent Match Plan", "Opponent Prep + Match Center", "/opponent-prep"],
  ["Executive Review", "Summary + Data Health", "/executive-summary"],
];

export default function SavedReportsPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHero
          eyebrow="Reports"
          title="Saved Reports"
          description="A future library for saved scouting, coaching and executive reports."
        />

        <section className="grid gap-5">
          {reports.map(([title, text, href]) => (
            <Link key={title} href={href} className="glass-card rounded-3xl p-6 transition hover:scale-[1.01]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black">{title}</h2>
                  <p className="mt-2 text-slate-300">{text}</p>
                </div>
                <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-cyan-300">
                  Open
                </span>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
