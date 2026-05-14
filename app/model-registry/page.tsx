const models = [
  {
    name: "Poisson Goal Model",
    version: "v1.0",
    status: "Production",
    purpose: "Torwahrscheinlichkeiten und Scoreline Matrix",
    inputs: "Team xG, Attack, Defense, Home/Away",
  },
  {
    name: "Elo Strength Engine",
    version: "v1.1",
    status: "Production",
    purpose: "Teamstärke und Matchup-Bewertung",
    inputs: "Match Results, Home/Away, League Context",
  },
  {
    name: "Monte Carlo Prediction Engine",
    version: "v2.0",
    status: "Beta",
    purpose: "Match Simulation und Confidence Scores",
    inputs: "Poisson, Elo, xG, Form",
  },
  {
    name: "Event Intelligence Engine",
    version: "v1.0",
    status: "Beta",
    purpose: "xThreat, Possession Value, Momentum",
    inputs: "Shots, Passes, Pressure Events",
  },
  {
    name: "Recruitment AI",
    version: "v0.5",
    status: "Experimental",
    purpose: "Player Similarity und Squad Fit",
    inputs: "Player Events, Role Metrics, xG",
  },
];

export default function ModelRegistryPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Machine Learning Operations
          </p>

          <h1 className="text-5xl font-bold">
            Model Registry
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Übersicht über alle Analyse- und
            Prediction-Modelle deiner Football
            Intelligence Platform.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card
            title="Models"
            value={models.length.toString()}
          />

          <Card
            title="Production"
            value={models
              .filter(
                (m) => m.status === "Production"
              )
              .length.toString()}
          />

          <Card
            title="Beta / Experimental"
            value={models
              .filter(
                (m) => m.status !== "Production"
              )
              .length.toString()}
          />
        </section>

        <section className="grid gap-5">
          {models.map((m) => (
            <div
              key={m.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-sm text-cyan-300">
                    {m.version}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {m.name}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {m.purpose}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm ${
                    m.status === "Production"
                      ? "bg-emerald-400/20 text-emerald-300"
                      : m.status === "Beta"
                      ? "bg-yellow-400/20 text-yellow-300"
                      : "bg-purple-400/20 text-purple-300"
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Inputs
                </p>

                <p className="mt-2 text-slate-300">
                  {m.inputs}
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
