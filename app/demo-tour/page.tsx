import Link from "next/link";
import PageHero from "@/components/PageHero";

const steps = [
  ["1", "Start at Dashboard", "Get a simple overview of matches, teams, players and reports.", "/"],
  ["2", "Open Club House", "Explore all clubs through modern club cards.", "/club-house"],
  ["3", "Check Scout Dashboard", "Find the best players and AI recruitment targets.", "/scout-dashboard"],
  ["4", "Use Match Center", "Analyse individual matches with score and event maps.", "/match-center"],
  ["5", "Review Data Health", "Understand whether your data is good enough for advanced analytics.", "/data-health"],
];

export default function DemoTourPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Guided Experience"
          title="Demo Tour"
          description="A simple guided path through the Football Intelligence Platform."
        />

        <section className="grid gap-5">
          {steps.map(([num, title, text, href]) => (
            <Link key={title} href={href} className="glass-card rounded-3xl p-6 transition hover:scale-[1.01]">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400 text-2xl font-black text-slate-950">
                  {num}
                </div>

                <div>
                  <h2 className="text-3xl font-black">{title}</h2>
                  <p className="mt-2 text-slate-300">{text}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
