import PageHero from "@/components/PageHero";

const blocks = [
  {
    title: "For Clubs",
    text: "Understand team performance, strengths, weaknesses and match trends.",
  },
  {
    title: "For Scouts",
    text: "Identify player profiles, AI scores and recruitment opportunities.",
  },
  {
    title: "For Coaches",
    text: "Prepare opponents, review tactical risks and get simple recommendations.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <PageHero
          eyebrow="About Platform"
          title="Built for Football Decisions"
          description="A modern football analytics platform combining match data, event intelligence, scouting views and AI-assisted reports."
        />

        <section className="grid gap-6 md:grid-cols-3">
          {blocks.map((b) => (
            <div key={b.title} className="glass-card rounded-3xl p-8">
              <h2 className="text-3xl font-black">{b.title}</h2>
              <p className="mt-4 text-slate-300">{b.text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
