import PageHero from "@/components/PageHero";

const insights = [
  {
    title: "Bayern attacking intensity increased",
    level: "High Impact",
    text: "Shot volume and final-third entries are significantly above league average.",
  },
  {
    title: "Arsenal possession model stable",
    level: "Control",
    text: "Passing network remains among the strongest across tracked clubs.",
  },
  {
    title: "Liverpool transition threat detected",
    level: "Fast Break",
    text: "Counter-attacks create high xG opportunities within 8 seconds.",
  },
  {
    title: "Defensive weakness identified",
    level: "Risk",
    text: "Several clubs allow too many central shots under pressure.",
  },
  {
    title: "Scout model found elite profile",
    level: "Scouting",
    text: "A high-value player profile exceeded the AI recruitment threshold.",
  },
  {
    title: "Prediction engine recalibrated",
    level: "AI Core",
    text: "Probability model updated after latest event ingestion.",
  },
];

export default function AIInsightsPage() {
  return (
    <main className="min-h-screen stadium-page p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">

        <PageHero
          eyebrow="Artificial Intelligence"
          title="AI Insights"
          description="Automatisch generierte Erkenntnisse aus Match-, Team- und Eventdaten."
        />

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {insights.map((item, i) => (
            <div
              key={i}
              className="glass-card rounded-3xl p-7"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                  {item.level}
                </span>

                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <h2 className="mt-6 text-3xl font-black">
                {item.title}
              </h2>

              <p className="mt-4 text-slate-300">
                {item.text}
              </p>

              <div className="mt-6 h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  style={{
                    width: `${70 + (i * 4)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
