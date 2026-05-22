import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${v.toFixed(1)}%`;
}

export default async function PublicTrackRecordPage() {
  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3000,
  });

  const total = rows.length;
  const wins = rows.filter((r) => r.isCorrect).length;
  const losses = total - wins;

  const overall =
    total > 0
      ? (wins / total) * 100
      : 0;

  const byMarket = new Map<
    string,
    {
      total: number;
      wins: number;
    }
  >();

  for (const row of rows) {
    const current = byMarket.get(row.market) || {
      total: 0,
      wins: 0,
    };

    current.total++;

    if (row.isCorrect) {
      current.wins++;
    }

    byMarket.set(row.market, current);
  }

  const markets = Array.from(byMarket.entries())
    .map(([market, s]) => ({
      market,
      total: s.total,
      wins: s.wins,
      accuracy:
        s.total > 0
          ? (s.wins / s.total) * 100
          : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Performance
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Performance
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Historische Auswertung der gespeicherten Prognosen.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card label="Prognosen" value={total} />
          <Card label="Richtig" value={wins} />
          <Card label="Falsch" value={losses} />
          <Card label="Trefferquote" value={pct(overall)} />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            Märkte
          </p>

          <div className="mt-5 overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-neutral-500">
                  <th className="px-4 py-3">Markt</th>
                  <th className="px-4 py-3">Prognosen</th>
                  <th className="px-4 py-3">Richtig</th>
                  <th className="px-4 py-3">Trefferquote</th>
                </tr>
              </thead>

              <tbody>
                {markets.map((m) => (
                  <tr
                    key={m.market}
                    className="border-b border-white/5"
                  >
                    <td className="px-4 py-4 font-black">
                      {m.market}
                    </td>

                    <td className="px-4 py-4">
                      {m.total}
                    </td>

                    <td className="px-4 py-4">
                      {m.wins}
                    </td>

                    <td className="px-4 py-4 font-black text-emerald-300">
                      {pct(m.accuracy)}
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
