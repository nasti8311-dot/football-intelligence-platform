const experiments = [
  {
    name: "Win Probability Model",
    accuracy: "71%",
    status: "Training",
  },
  {
    name: "xThreat Engine",
    accuracy: "84%",
    status: "Production",
  },
  {
    name: "Recruitment Similarity AI",
    accuracy: "67%",
    status: "Beta",
  },
  {
    name: "Pressing Detection",
    accuracy: "73%",
    status: "Experimental",
  },
];

export default function MLLabPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Machine Learning Operations
          </p>

          <h1 className="text-5xl font-bold">
            ML Lab
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Experimentelle Modelle, AI-Training
            und Performance Tracking.
          </p>
        </section>

        <section className="grid gap-5">
          {experiments.map((e) => (
            <div
              key={e.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {e.name}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Accuracy: {e.accuracy}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm ${
                    e.status === "Production"
                      ? "bg-emerald-400/20 text-emerald-300"
                      : e.status === "Training"
                      ? "bg-cyan-400/20 text-cyan-300"
                      : e.status === "Beta"
                      ? "bg-yellow-400/20 text-yellow-300"
                      : "bg-purple-400/20 text-purple-300"
                  }`}
                >
                  {e.status}
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
