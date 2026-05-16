import PageHero from "@/components/PageHero";

const cases = [
  {
    title: "Recruitment Shortlist",
    text: "A scouting team can identify top player profiles using AI scores, event data and role classification.",
  },
  {
    title: "Opponent Preparation",
    text: "Coaches can prepare match plans from opponent strengths, weaknesses and recent performance.",
  },
  {
    title: "Club Performance Review",
    text: "Analysts can review team form, goal difference, event maps and tactical profile in one place.",
  },
];

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="Use Cases"
          title="Case Studies"
          description="Examples of how clubs, scouts and analysts can use the platform."
        />

        <section className="grid gap-6 md:grid-cols-3">
          {cases.map((c) => (
            <div key={c.title} className="glass-card rounded-3xl p-8">
              <h2 className="text-3xl font-black">{c.title}</h2>
              <p className="mt-4 text-slate-300">{c.text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
