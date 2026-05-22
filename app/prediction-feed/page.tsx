import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PredictionFeedPage() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const snapshots = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
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
      {
        valueScore: "desc",
      },
      {
        probability: "desc",
      },
    ],
    take: 100,
  });

  const picks = snapshots
    .map((s) => {
      const oddsRows =
        (s.match.bookmakerOdds?.length || 0) +
        (s.match.odds?.length || 0);

      return {
        id: s.id,
        match: `${s.match.homeTeam?.name} vs ${s.match.awayTeam?.name}`,
        league: s.match.league?.name || "Unknown",
        kickoff: s.match.kickoff,
        market: s.market,
        pick: s.pick,
        probability: s.probability,
        confidence: s.confidence,
        valueScore: s.valueScore,
        oddsRows,
      };
    })
    .filter((p) => p.oddsRows > 0);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Prediction Feed
          </p>
          <h1 className="mt-3 text-5xl font-black">Prediction Feed</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Kommende gespeicherte Predictions mit Odds-Verfügbarkeit.
          </p>
        </section>

        <section className="grid gap-4">
          {picks.map((p) => (
            <div key={p.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xl font-black">{p.match}</p>
                  <p className="mt-1 text-sm text-neutral-500">{p.league}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {p.kickoff ? new Date(p.kickoff).toLocaleString("de-DE") : "—"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-emerald-300">{p.market}</p>
                  <p className="mt-1 text-2xl font-black">{p.pick}</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {Number(p.probability).toFixed(1)}% · {p.confidence}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {picks.length === 0 ? (
            <div className="rounded-[1.5rem] border border-yellow-400/20 bg-yellow-500/10 p-5 text-yellow-100">
              Aktuell keine veröffentlichbaren gespeicherten Predictions mit Odds.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
