import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalize(v: number) {
  return v > 1 ? v / 100 : v;
}

function edge(prob: number, implied: number) {
  return (normalize(prob) - implied) * 100;
}

export default async function ValueAnalysisPage() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: { not: null },
      impliedProb: { not: null },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5000,
  });

  const enriched = rows.map((r) => {
    const e = edge(
      Number(r.probability),
      Number(r.impliedProb || 0)
    );

    return {
      ...r,
      edge: e,
    };
  });

  const positive = enriched.filter((r) => r.edge > 4);
  const correct = positive.filter((r) => r.isCorrect).length;

  const roi =
    positive.length > 0
      ? (
          positive.reduce((acc, r) => {
            const odds = Number(r.oddsPrice || 0);

            if (!odds) return acc;

            if (r.isCorrect) {
              return acc + (odds - 1);
            }

            return acc - 1;
          }, 0) /
          positive.length
        ) * 100
      : 0;

  const accuracy =
    positive.length > 0
      ? (correct / positive.length) * 100
      : 0;

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            VALUE ENGINE
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Value Betting Analyse
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Analyse echter Prediction-Snapshots gegen Markt-Wahrscheinlichkeiten.
            Kein Fake-ROI — nur historische resolved Picks.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card
            label="Value Picks"
            value={positive.length}
          />

          <Card
            label="Accuracy"
            value={`${accuracy.toFixed(1)}%`}
          />

          <Card
            label="Theoretical ROI"
            value={`${roi.toFixed(1)}%`}
          />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                VALUE PICKS
              </p>

              <h2 className="mt-1 text-3xl font-black">
                Historische Edges
              </h2>
            </div>
          </div>

          <div className="mt-6 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-neutral-500">
                  <th className="px-4 py-3">Markt</th>
                  <th className="px-4 py-3">Pick</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Market</th>
                  <th className="px-4 py-3">Edge</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>

              <tbody>
                {positive.slice(0, 100).map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5"
                  >
                    <td className="px-4 py-4 font-bold">
                      {r.market}
                    </td>

                    <td className="px-4 py-4">
                      {r.pick}
                    </td>

                    <td className="px-4 py-4">
                      {(normalize(Number(r.probability)) * 100).toFixed(1)}%
                    </td>

                    <td className="px-4 py-4">
                      {(Number(r.impliedProb || 0) * 100).toFixed(1)}%
                    </td>

                    <td className="px-4 py-4 font-black text-emerald-300">
                      {r.edge.toFixed(1)}%
                    </td>

                    <td className="px-4 py-4">
                      {r.isCorrect ? (
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
                          WIN
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-black text-red-300">
                          LOSS
                        </span>
                      )}
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

function Card({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>

      <p className="mt-2 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}
