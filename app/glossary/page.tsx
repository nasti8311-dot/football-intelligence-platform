import PageHero from "@/components/PageHero";

const terms = [
  ["xG", "Expected Goals: the probability that a shot becomes a goal."],
  ["Event", "An on-ball action such as pass, shot, carry, tackle or cross."],
  ["xThreat", "A value estimating how much an action increases attacking danger."],
  ["Progressive Action", "A pass or carry that moves the ball closer to goal."],
  ["AI Score", "A simplified player or team score calculated from available metrics."],
  ["Data Health", "A quality score showing whether your data is rich enough for analysis."],
];

export default function GlossaryPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHero
          eyebrow="Education"
          title="Glossary"
          description="Clear explanations of the most important football analytics terms."
        />

        <section className="grid gap-5">
          {terms.map(([term, desc]) => (
            <div key={term} className="glass-card rounded-3xl p-7">
              <h2 className="text-3xl font-black text-cyan-300">{term}</h2>
              <p className="mt-3 text-slate-300">{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
