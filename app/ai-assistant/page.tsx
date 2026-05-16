import PageHero from "@/components/PageHero";

const prompts = [
  "Which team has the strongest attack profile?",
  "Show me high-value transfer targets.",
  "Which club allows the most shots centrally?",
  "Prepare an opponent report for Bayern.",
  "Which players exceed scouting thresholds?",
];

export default function AIAssistantPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHero
          eyebrow="Artificial Intelligence"
          title="AI Assistant"
          description="A future AI workflow for football scouting, coaching and analytics questions."
        />

        <section className="glass-card rounded-3xl p-8">
          <div className="rounded-3xl bg-slate-950/60 p-6">
            <p className="text-sm text-cyan-300">AI Assistant</p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 px-5 py-4 text-slate-500">
              Ask anything about teams, matches, scouting or performance...
            </div>

            <button className="mt-5 rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
              Coming Soon
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          {prompts.map((p) => (
            <div key={p} className="glass-card rounded-2xl p-5">
              <p className="font-bold text-slate-200">{p}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
