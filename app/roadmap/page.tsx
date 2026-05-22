const roadmap = [
  {
    phase: "Phase 1",
    title: "Public Beta Stabilisierung",
    status: "AKTIV",
    items: [
      "Verified Picks schärfen",
      "Odds Coverage verbessern",
      "Homepage polish",
      "Mobile UX verbessern",
      "Track Record öffentlich machen",
    ],
  },
  {
    phase: "Phase 2",
    title: "Model Quality",
    status: "NÄCHSTES",
    items: [
      "xG Engine v2",
      "Draw Model verbessern",
      "Goal Markets kalibrieren",
      "Closing Line Tracking",
      "CLV Analyse",
    ],
  },
  {
    phase: "Phase 3",
    title: "Premium Quant Features",
    status: "GEPLANT",
    items: [
      "Saved Picks",
      "User Accounts",
      "ROI Dashboard",
      "Push Notifications",
      "Sharp Pick Feed",
    ],
  },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Roadmap
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
            Was bereits steht, was als nächstes kommt und wohin sich die Plattform entwickelt.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {roadmap.map((item) => (
            <article
              key={item.phase}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                  {item.phase}
                </p>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black text-emerald-300">
                  {item.status}
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-black">
                {item.title}
              </h2>

              <div className="mt-5 space-y-3">
                {item.items.map((entry) => (
                  <div
                    key={entry}
                    className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-neutral-300"
                  >
                    {entry}
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
