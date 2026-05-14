const modules = [
  "Match Intelligence",
  "Recruitment AI",
  "Live Tactical Analysis",
  "Academy Analytics",
  "Medical Risk Models",
  "Training Load Monitoring",
  "Transfer Intelligence",
  "Board Reporting",
];

export default function ClubOSPage() {
  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-10">
        <section>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Football Operating System
          </p>

          <h1 className="mt-2 text-6xl font-black">
            Club OS
          </h1>

          <p className="mt-4 max-w-4xl text-slate-400">
            Vollständige AI-Infrastruktur für
            professionelle Fußballclubs.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <div
              key={m}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-sm text-cyan-300">
                    System Module
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {m}
                  </h2>
                </div>

                <button className="mt-8 rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-slate-950">
                  Open Module
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.06] p-8">
          <p className="text-sm text-cyan-300">
            Strategic Vision
          </p>

          <h2 className="mt-2 text-4xl font-black">
            Unified Football Intelligence
          </h2>

          <p className="mt-4 max-w-4xl text-slate-300">
            Deine Plattform entwickelt sich
            gerade von einem Analytics-Tool zu
            einem vollständigen Club Operating
            System für Recruitment, Coaching,
            Match Analysis und Decision Making.
          </p>
        </section>
      </div>
    </main>
  );
}
