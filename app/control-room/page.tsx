const systems = [
  {
    name: "Prediction Engine",
    status: "Online",
    health: 96,
  },
  {
    name: "Recruitment AI",
    status: "Online",
    health: 88,
  },
  {
    name: "Live Match Engine",
    status: "Online",
    health: 91,
  },
  {
    name: "Event Intelligence",
    status: "Online",
    health: 94,
  },
  {
    name: "ML Training",
    status: "Running",
    health: 72,
  },
  {
    name: "Feature Store",
    status: "Online",
    health: 98,
  },
];

export default function ControlRoomPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Platform Operations
          </p>

          <h1 className="text-5xl font-bold">
            AI Control Room
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Monitoring für alle Football-AI-,
            Prediction- und Tactical-Systeme.
          </p>
        </section>

        <section className="grid gap-5">
          {systems.map((s) => (
            <div
              key={s.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {s.name}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    System Health Monitoring
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-4 py-2 text-sm ${
                      s.status === "Online"
                        ? "bg-emerald-400/20 text-emerald-300"
                        : "bg-cyan-400/20 text-cyan-300"
                    }`}
                  >
                    {s.status}
                  </span>

                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      Health
                    </p>

                    <p className="text-2xl font-bold text-cyan-300">
                      {s.health}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-4 rounded-full bg-slate-800">
                <div
                  className="h-4 rounded-full bg-cyan-400"
                  style={{
                    width: `${s.health}%`,
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
