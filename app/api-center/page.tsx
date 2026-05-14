const apis = [
  {
    name: "Prediction API",
    endpoint: "/api/predictions",
    status: "Online",
    latency: "84ms",
  },
  {
    name: "Recruitment API",
    endpoint: "/api/recruitment",
    status: "Online",
    latency: "112ms",
  },
  {
    name: "Event Intelligence API",
    endpoint: "/api/events",
    status: "Online",
    latency: "67ms",
  },
  {
    name: "Live Match API",
    endpoint: "/api/live",
    status: "Beta",
    latency: "140ms",
  },
];

export default function ApiCenterPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">Developer Platform</p>
          <h1 className="text-5xl font-bold">API Center</h1>
          <p className="mt-3 max-w-3xl text-slate-400">
            Übersicht über alle Football Intelligence APIs und System-Endpunkte.
          </p>
        </section>

        <section className="grid gap-5">
          {apis.map((a) => (
            <div
              key={a.name}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-cyan-300">{a.endpoint}</p>
                  <h2 className="mt-1 text-2xl font-bold">{a.name}</h2>
                  <p className="mt-2 text-slate-400">
                    Average Latency: {a.latency}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm ${
                    a.status === "Online"
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-yellow-400/20 text-yellow-300"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
