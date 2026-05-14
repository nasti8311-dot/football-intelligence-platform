const alerts = [
  {
    title: "High Pressing Detected",
    level: "Critical",
    detail: "Team zeigt aggressive Pressing-Sequenzen.",
  },
  {
    title: "xThreat Surge",
    level: "Warning",
    detail: "Mehrere gefährliche Aktionen in kurzer Zeit.",
  },
  {
    title: "Momentum Swing",
    level: "Info",
    detail: "Spielkontrolle wechselt dynamisch.",
  },
  {
    title: "Recruitment Opportunity",
    level: "Info",
    detail: "Spielerprofil mit hoher Similarity erkannt.",
  },
];

export default function WarRoomPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-red-400">
            Tactical Operations
          </p>

          <h1 className="text-5xl font-bold">
            War Room
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Echtzeit-Warnungen, Tactical Alerts
            und Match-Intelligence.
          </p>
        </section>

        <section className="grid gap-5">
          {alerts.map((a) => (
            <div
              key={a.title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {a.title}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    {a.detail}
                  </p>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm ${
                    a.level === "Critical"
                      ? "bg-red-400/20 text-red-300"
                      : a.level === "Warning"
                      ? "bg-yellow-400/20 text-yellow-300"
                      : "bg-cyan-400/20 text-cyan-300"
                  }`}
                >
                  {a.level}
                </span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
