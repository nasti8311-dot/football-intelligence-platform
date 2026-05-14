const targets = [
  {
    player: "Luca Marin",
    club: "FC North",
    fit: 92,
    value: "€18M",
    role: "Progressor",
  },
  {
    player: "Daniel Costa",
    club: "Sporting Elite",
    fit: 88,
    value: "€24M",
    role: "Finisher",
  },
  {
    player: "Mika Olsen",
    club: "Nordic FK",
    fit: 84,
    value: "€11M",
    role: "Presser",
  },
  {
    player: "Rafael Mendes",
    club: "Atletico Blue",
    fit: 81,
    value: "€31M",
    role: "Creator",
  },
];

export default function TransferCenterPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section>
          <p className="text-sm text-cyan-400">
            Recruitment Intelligence
          </p>

          <h1 className="text-5xl font-bold">
            Transfer Center
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            AI-basierte Transferziele,
            Squad-Fit und Marktwerte.
          </p>
        </section>

        <section className="grid gap-5">
          {targets.map((t) => (
            <div
              key={t.player}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-cyan-300">
                    {t.club}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {t.player}
                  </h2>

                  <p className="mt-2 text-slate-400">
                    Role: {t.role}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      Squad Fit
                    </p>

                    <p className="text-3xl font-bold text-emerald-300">
                      {t.fit}%
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      Market Value
                    </p>

                    <p className="text-2xl font-bold text-cyan-300">
                      {t.value}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 h-4 rounded-full bg-slate-800">
                <div
                  className="h-4 rounded-full bg-emerald-400"
                  style={{
                    width: `${t.fit}%`,
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
