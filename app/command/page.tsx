const modules = [
  {
    name: "Prediction Engine",
    status: "Operational",
    color: "cyan",
  },
  {
    name: "Recruitment AI",
    status: "Operational",
    color: "emerald",
  },
  {
    name: "Live Match Intelligence",
    status: "Running",
    color: "yellow",
  },
  {
    name: "Tactical Analytics",
    status: "Operational",
    color: "purple",
  },
  {
    name: "Event Intelligence",
    status: "Operational",
    color: "cyan",
  },
  {
    name: "ML Training Pipeline",
    status: "Training",
    color: "red",
  },
];

export default function CommandCenterPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Central Intelligence System
          </p>

          <h1 className="mt-2 text-6xl font-black">
            Command Center
          </h1>

          <p className="mt-4 max-w-3xl text-slate-400">
            Zentrale Steuerung aller AI-,
            Prediction-, Tactical- und
            Recruitment-Systeme.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {modules.map((m) => (
            <div
              key={m.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {m.name}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    System Status Monitoring
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm ${
                    m.color === "cyan"
                      ? "bg-cyan-400/20 text-cyan-300"
                      : m.color === "emerald"
                      ? "bg-emerald-400/20 text-emerald-300"
                      : m.color === "yellow"
                      ? "bg-yellow-400/20 text-yellow-300"
                      : m.color === "purple"
                      ? "bg-purple-400/20 text-purple-300"
                      : "bg-red-400/20 text-red-300"
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="mt-5 h-4 rounded-full bg-slate-800">
                <div
                  className={`h-4 rounded-full ${
                    m.color === "cyan"
                      ? "bg-cyan-400"
                      : m.color === "emerald"
                      ? "bg-emerald-400"
                      : m.color === "yellow"
                      ? "bg-yellow-400"
                      : m.color === "purple"
                      ? "bg-purple-400"
                      : "bg-red-400"
                  }`}
                  style={{
                    width: `${
                      m.status === "Operational"
                        ? 96
                        : m.status === "Running"
                        ? 82
                        : 67
                    }%`,
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
