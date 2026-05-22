import { prisma } from "@/lib/prisma";
import PremiumPickCard from "@/components/picks/PremiumPickCard";

export const dynamic = "force-dynamic";

function scorePick(p: any) {
  const marketPenalty =
    p.market?.includes("Über 2.5") ? 12 :
    p.market?.includes("Unter 2.5") ? 6 :
    p.market?.includes("Beide") ? 3 :
    0;

  return Number(p.probability || 0) + Number(p.valueScore || 0) - marketPenalty;
}

export default async function VerifiedPicksPage() {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
      match: {
        kickoff: {
          gte: now,
          lte: end,
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
    take: 250,
  });

  const allRanked = rows
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
        probability: Number(p.probability || 0),
        confidence: p.confidence || "Model",
        valueScore: p.valueScore || 0,
        oddsRows,
        qualityScore: scorePick(p) + oddsRows,
      };
    })
    .filter((p) => p.oddsRows > 0)
    .filter((p) => p.probability >= 48)
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const strictPicks = allRanked
    .filter((p) => p.oddsRows > 0)
    .filter((p) => p.probability >= 48)
    .slice(0, 10);

  const fallbackPicks = allRanked
    .filter((p) => p.oddsRows > 0)
    .slice(0, 3);

  const picks =
    strictPicks.length >= 3
      ? strictPicks
      : fallbackPicks;

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/[0.04] to-black p-8 shadow-[0_0_120px_rgba(16,185,129,0.08)] md:p-12">
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
              Täglich aktualisierte Auswahl
            </div>

            <h1 className="mt-6 text-6xl font-black tracking-tight leading-none md:text-8xl">
              Daily Picks
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-8 text-neutral-400">
              Jeden Tag maximal 10 ausgewählte Spiele mit Modellbewertung,
              Quoten-Daten und Qualitätsfilter.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Stat label="Angezeigte Picks" value={picks.length} />
              <Stat label="Ziel" value="3–10" />
              <Stat label="Update" value="Daily" />
            </div>
          </div>
        </section>

        {picks.length > 0 ? (
          <section className="grid gap-5 lg:grid-cols-3">
            {picks.map((p) => (
              <PremiumPickCard
                key={p.id}
                match={p.match}
                league={p.league}
                kickoff={p.kickoff}
                market={p.market}
                pick={p.pick}
                probability={p.probability}
                confidence={p.confidence}
                valueScore={p.valueScore}
                oddsRows={p.oddsRows}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-6 text-yellow-100">
            <h2 className="text-2xl font-black">Heute zu wenige Qualitäts-Picks</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7">
              Aktuell fehlen ausreichend Spiele mit Quoten-Daten oder Modellqualität.
              Die Seite aktualisiert sich täglich automatisch. Wenn weniger als 3 starke Picks verfügbar sind,
              zeigen wir bewusst keine schwachen Prognosen.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
