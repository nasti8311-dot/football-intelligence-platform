import PageHero from "@/components/PageHero";

const faqs = [
  ["Are the data real?", "Match data can be real from CSV imports. Some event/player/scouting values may be synthetic demo data unless connected to a professional data provider."],
  ["What should I upload?", "Football-Data CSVs for matches, or event CSVs with team, player, eventType, minute, x, y, endX, endY and xG fields."],
  ["Why are some values estimated?", "Advanced scouting, xG and AI scores need rich event data. When missing, the demo uses generated values for visualization."],
  ["Can this become a real SaaS?", "Yes. The platform already has database, deployment, routing, dashboards and analytics structure. Next steps are auth, billing and real data feeds."],
];

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHero
          eyebrow="Support"
          title="Help Center"
          description="Simple answers for users who are new to the Football Intelligence Platform."
        />

        <section className="grid gap-5">
          {faqs.map(([q, a]) => (
            <div key={q} className="glass-card rounded-3xl p-7">
              <h2 className="text-2xl font-black">{q}</h2>
              <p className="mt-3 text-slate-300">{a}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
