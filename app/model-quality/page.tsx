import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalize(probability: number) {
  return probability > 1 ? probability / 100 : probability;
}

function bucket(probability: number) {
  return Math.floor(normalize(probability) * 10) / 10;
}

function bayesianAccuracy(correct: number, total: number, prior = 0.55, strength = 12) {
  return (correct + prior * strength) / (total + strength);
}

export default async function ModelQualityPage() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: { isCorrect: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const total = rows.length;
  const correct = rows.filter((r) => r.isCorrect).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  const byMarket = new Map<string, { total: number; correct: number }>();
  const byBucket = new Map<string, { market: string; bucket: number; total: number; correct: number }>();

  for (const row of rows) {
    const market = byMarket.get(row.market) || { total: 0, correct: 0 };
    market.total++;
    if (row.isCorrect) market.correct++;
    byMarket.set(row.market, market);

    const b = bucket(Number(row.probability));
    const key = `${row.market}:${b}`;
    const item = byBucket.get(key) || { market: row.market, bucket: b, total: 0, correct: 0 };
    item.total++;
    if (row.isCorrect) item.correct++;
    byBucket.set(key, item);
  }

  const markets = Array.from(byMarket.entries())
    .map(([market, s]) => ({
      market,
      total: s.total,
      accuracy: s.total ? Math.round((s.correct / s.total) * 100) : 0,
      smoothed: Math.round(bayesianAccuracy(s.correct, s.total) * 100),
    }))
    .sort((a, b) => b.total - a.total);

  const calibration = Array.from(byBucket.values())
    .filter((b) => b.total >= 5)
    .map((b) => ({
      ...b,
      predicted: Math.round(b.bucket * 100),
      smoothed: Math.round(bayesianAccuracy(b.correct, b.total) * 100),
    }))
    .sort((a, b) => a.market.localeCompare(b.market) || a.predicted - b.predicted);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Quant Center
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Modellqualität
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Echte Auswertung aus gespeicherten Prediction-Snapshots: Accuracy,
            Marktqualität und geglättete Calibration statt Fake-Confidence.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/verified-picks" className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
              Verified Picks
            </Link>
            <Link href="/performance" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white">
              Performance
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Stat label="Resolved Picks" value={total} />
          <Stat label="Treffer" value={correct} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Panel title="Marktqualität" subtitle="Welche Märkte aktuell brauchbar sind">
            <div className="space-y-3">
              {markets.map((m) => (
                <div key={m.market} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{m.market}</p>
                      <p className="text-xs text-neutral-500">{m.total} resolved Picks</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-300">{m.smoothed}%</p>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">Smoothed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Calibration Buckets" subtitle="Prediction-Prozent vs. geglättete Realität">
            <div className="max-h-[620px] space-y-3 overflow-auto pr-1">
              {calibration.map((c) => (
                <div key={`${c.market}-${c.bucket}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black">{c.market}</p>
                      <p className="text-xs text-neutral-500">{c.total} Samples</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">
                        Modell {c.predicted}% → Real {c.smoothed}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
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

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
        {subtitle}
      </p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
