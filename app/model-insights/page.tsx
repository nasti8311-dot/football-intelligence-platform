import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ModelInsightsPage() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
    take: 3000,
  });

  const byMarket: any = {};

  for (const row of rows) {
    if (!byMarket[row.market]) {
      byMarket[row.market] = {
        total: 0,
        wins: 0,
      };
    }

    byMarket[row.market].total++;

    if (row.isCorrect) {
      byMarket[row.market].wins++;
    }
  }

  const markets = Object.entries(byMarket)
    .map(([market, v]: any) => ({
      market,
      total: v.total,
      wins: v.wins,
      accuracy:
        v.total > 0
          ? (v.wins / v.total) * 100
          : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Quant Research
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Model Insights
          </h1>
        </section>

        <section className="grid gap-4">
          {markets.map((m) => (
            <div
              key={m.market}
              className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div>
                <p className="text-xl font-black">{m.market}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {m.total} Predictions
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-black text-emerald-300">
                  {m.accuracy.toFixed(1)}%
                </p>

                <p className="text-xs text-neutral-500">
                  Accuracy
                </p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
