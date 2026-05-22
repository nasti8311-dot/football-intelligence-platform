const updates = [
  {
    version: "v0.9",
    title: "Quant Platform Foundation",
    items: [
      "Verified Picks System",
      "Prediction Snapshots",
      "Historical Resolver",
      "Calibration Engine",
      "Model Quality Dashboard",
      "Public Track Record",
      "Quant Hub",
    ],
  },
  {
    version: "v0.8",
    title: "Advanced Modelling",
    items: [
      "ELO Ratings",
      "Advanced Team Form Engine",
      "Expected Goals Engine",
      "Probability Calibration",
      "Value Analysis",
    ],
  },
  {
    version: "v0.7",
    title: "Data Infrastructure",
    items: [
      "Odds Sync",
      "Historical Match Sync",
      "Odds Coverage Monitoring",
      "Health Endpoints",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Development
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Changelog
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
            Öffentliche Übersicht der wichtigsten Plattform-Entwicklungen.
          </p>
        </section>

        <section className="space-y-5">
          {updates.map((update) => (
            <article
              key={update.version}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                    {update.version}
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {update.title}
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {update.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-neutral-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
