import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SharpFeedPage() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const picks = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
      probability: {
        gte: 60,
      },
      match: {
        kickoff: {
          gte: now,
          lte: in3Days,
        },
      },
    },
    include: {
      match: {
        include: {
          league: true,
          homeTeam: true,
          awayTeam: true,
          bookmakerOdds: true,
          odds: true,
        },
      },
    },
    orderBy: [
      { valueScore: "desc" },
      { probability: "desc" },
    ],
    take: 50,
  });

  const sharp = picks
    .map((p) => {
      const oddsRows =
        (p.match.bookmakerOdds?.length || 0) +
        (p.match.odds?.length || 0);

      return {
        id: p.id,
        match: `${p.match.homeTeam?.name} vs ${p.match.awayTeam?.name}`,
        league: p.match.league?.name || "Unknown",
        kickoff: p.match.kickoff,
        market: p.market,
        pick: p.pick,
        probability: p.probability,
        confidence: p.confidence,
        valueScore: p.valueScore,
        oddsRows,
      };
    })
    .filter((p) => p.oddsRows > 0);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Sharp Feed
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Sharp Feed
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Höher priorisierte Picks mit Mindestwahrscheinlichkeit, Odds-Verfügbarkeit
            und Value Score.
          </p>
        </section>

        <section className="grid gap-4">
          {sharp.map((p) => (
            <div
              key={p.id}
              className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xl font-black">
                    {p.match}
                  </p>

                  <p className="mt-1 text-sm text-neutral-400">
                    {p.league}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {p.kickoff ? new Date(p.kickoff).toLocaleString("de-DE") : "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-emerald-300">
                    {p.market}
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {p.pick}
                  </p>

                  <p className="mt-1 text-sm text-neutral-300">
                    {Number(p.probability).toFixed(1)}% · Value {p.valueScore}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {sharp.length === 0 ? (
            <div className="rounded-[1.5rem] border border-yellow-400/20 bg-yellow-500/10 p-5 text-yellow-100">
              Aktuell keine Sharp Picks mit ausreichender Datenqualität.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
