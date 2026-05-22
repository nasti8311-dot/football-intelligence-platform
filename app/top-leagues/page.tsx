import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TopLeaguesPage() {
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
      map[league] = {
        matches: 0,
        withOdds: 0,
        oddsRows: 0,
      };
    }

    map[league].matches++;
    map[league].oddsRows += oddsRows;
    if (oddsRows > 0) map[league].withOdds++;
  }

  const leagues = Object.entries(map)
    .map(([league, v]) => ({
      league,
      ...v,
      score: v.withOdds * 10 + v.oddsRows,
      coverage: v.matches > 0 ? (v.withOdds / v.matches) * 100 : 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Free Tier Strategy
          </p>
          <h1 className="mt-3 text-5xl font-black">Top Leagues</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Welche Ligen sich für den kostenlosen Odds-Plan aktuell am meisten lohnen.
          </p>
        </section>

        <section className="grid gap-4">
          {leagues.map((row, index) => (
            <div
              key={row.league}
              className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                  Rank #{index + 1}
                </p>
                <p className="mt-1 text-2xl font-black">{row.league}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {row.matches} Matches · {row.withOdds} mit Odds · {row.oddsRows} Odds Rows
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-black text-emerald-300">
                  {row.coverage.toFixed(1)}%
                </p>
                <p className="text-xs text-neutral-500">Coverage</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
