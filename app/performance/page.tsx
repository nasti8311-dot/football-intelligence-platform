import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PerformancePage() {
  const resolved = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 2000,
  });

  const total = resolved.length;
  const correct = resolved.filter((p) => p.isCorrect).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const markets = new Map<string, { total: number; correct: number }>();

  for (const p of resolved) {
    const item = markets.get(p.market) || { total: 0, correct: 0 };
    item.total += 1;
    if (p.isCorrect) item.correct += 1;
    markets.set(p.market, item);
  }

  const marketRows = Array.from(markets.entries())
    .map(([market, stats]) => ({
      market,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Modellqualität
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Performance Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Echte Auswertung gespeicherter Predictions. Keine Fake-Accuracy, sondern resolved Snapshots aus der Datenbank.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Stat label="Resolved Picks" value={total} />
          <Stat label="Richtig" value={correct} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                Märkte
              </p>
              <h2 className="mt-1 text-2xl font-black">Performance nach Markt</h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.05] text-xs uppercase tracking-[0.16em] text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Markt</th>
                  <th className="px-4 py-3">Picks</th>
                  <th className="px-4 py-3">Richtig</th>
                  <th className="px-4 py-3">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {marketRows.map((row) => (
                  <tr key={row.market} className="border-t border-white/10">
                    <td className="px-4 py-4 font-black">{row.market}</td>
                    <td className="px-4 py-4 text-neutral-300">{row.total}</td>
                    <td className="px-4 py-4 text-neutral-300">{row.correct}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-black text-emerald-300">
                        {row.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
