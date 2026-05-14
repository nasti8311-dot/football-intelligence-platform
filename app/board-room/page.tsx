const metrics = [
  {
    title: "Prediction Accuracy",
    value: "71%",
    change: "+4.2%",
  },
  {
    title: "Monthly Active Analysts",
    value: "184",
    change: "+12%",
  },
  {
    title: "Enterprise Clubs",
    value: "7",
    change: "+2",
  },
  {
    title: "Event Processing",
    value: "2.8M",
    change: "+18%",
  },
];

const roadmap = [
  "Live Match AI",
  "Automated Scouting",
  "Club Collaboration",
  "Transfer Intelligence",
  "Advanced ML Pipelines",
];

export default function BoardRoomPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-purple-400">
            Executive Intelligence
          </p>

          <h1 className="text-5xl font-bold">
            Board Room
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Strategische Übersicht deiner
            Football Intelligence Platform.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <p className="text-sm text-slate-400">
                {m.title}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {m.value}
              </p>

              <p className="mt-2 text-sm text-emerald-300">
                {m.change}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <p className="text-sm text-purple-300">
            Product Roadmap
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Strategic Priorities
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {roadmap.map((r) => (
              <div
                key={r}
                className="rounded-2xl bg-slate-900 p-5"
              >
                <p className="font-semibold">
                  {r}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
