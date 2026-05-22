import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeagueCoveragePage() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
        lte: in3Days,
      },
    },
    include: {
      league: true,
      bookmakerOdds: true,
      odds: true,
    },
    take: 500,
  });

  const map: Record<string, { matches: number; withOdds: number; oddsRows: number }> = {};

  for (const match of matches) {
    const league = match.league?.name || "Unknown";
    const oddsRows = (match.bookmakerOdds?.length || 0) + (match.odds?.length || 0);

    if (!map[league]) {
      map[league] = { matches: 0, withOdds: 0, oddsRows: 0 };
    }

    map[league].matches++;
    map[league].oddsRows += oddsRows;
    if (oddsRows > 0) map[league].withOdds++;
  }

  const rows = Object.entries(map)
    .map(([league, v]) => ({
      league,
      ...v,
      coverage: v.matches > 0 ? (v.withOdds / v.matches) * 100 : 0,
    }))
    .sort((a, b) => b.coverage - a.coverage);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Data Coverage
          </p>
          <h1 className="mt-3 text-5xl font-black">League Coverage</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Odds-Abdeckung der nächsten 3 Tage nach Liga.
          </p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-neutral-500">
                  <th className="px-4 py-3">Liga</th>
                  <th className="px-4 py-3">Matches</th>
                  <th className="px-4 py-3">With Odds</th>
                  <th className="px-4 py-3">Odds Rows</th>
                  <th className="px-4 py-3">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.league} className="border-b border-white/5">
                    <td className="px-4 py-4 font-bold">{row.league}</td>
                    <td className="px-4 py-4">{row.matches}</td>
                    <td className="px-4 py-4">{row.withOdds}</td>
                    <td className="px-4 py-4">{row.oddsRows}</td>
                    <td className="px-4 py-4 font-black text-emerald-300">
                      {row.coverage.toFixed(1)}%
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
