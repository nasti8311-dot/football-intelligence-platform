import { prisma } from "@/lib/prisma";
import PremiumPickCard from "@/components/picks/PremiumPickCard";

import { selectBestTip } from "@/lib/select-best-tip";
import { calculateGoalMarkets } from "@/lib/goal-markets";

export const dynamic = "force-dynamic";

const priorityLeagues = [
  "premier league",
  "bundesliga",
  "la liga",
  "serie a",
  "ligue 1",
  "champions league",
];

function normalizeMatchKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|afc|sc|club|football|and|&|the)\b/g, "")
    .replace(/brighton hove albion/g, "brighton")
    .replace(/brighton and hove albion/g, "brighton")
    .replace(/manchester united/g, "man united")
    .replace(/manchester city/g, "man city")
    .replace(/newcastle united/g, "newcastle")
    .replace(/wolverhampton wanderers/g, "wolves")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function leagueBoost(league: string) {
  const l = String(league || "").toLowerCase();

  if (l.includes("premier league") || l.includes("soccer epl")) return 10;
  if (l.includes("la liga") || l.includes("primera")) return 8;
  if (l.includes("serie a")) return 8;
  if (l.includes("bundesliga")) return 8;
  if (l.includes("ligue 1")) return 6;
  if (l.includes("mls")) return 3;

  return 0;
}

function scorePick(p: any) {
  const marketPenalty =
    p.market === "Über 1,5 Tore"
      ? 12
      : p.market === "Unter 3,5 Tore"
      ? 6
      : 0;

  const leagueBonus = leagueBoost(
    String(p.match?.league?.name || p.league || "")
  );

  return (
    Number(p.probability || 0)
    + Number(p.valueScore || 0)
    + Number(p.oddsRows || 0)
    + Number(leagueBonus || 0)
    - Number(marketPenalty || 0)
  );
}

export default async function VerifiedPicksPage() {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2);

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

  const ranked = rows
    .map((p) => {
      const oddsRows =
        (p.match.bookmakerOdds?.length || 0) +
        (p.match.odds?.length || 0);

      const homeXg = Number(p.homeXg || 1.35);
      const awayXg = Number(p.awayXg || 1.15);

      const goalMarkets = calculateGoalMarkets(homeXg, awayXg);
      const over15 = goalMarkets.over15;
      const under35 = goalMarkets.under35;
      const over25 = Number(p.over25 || goalMarkets.over25);
      const btts = Number(p.bttsYes || goalMarkets.btts);

      const bestTip = selectBestTip({
        homeWin: Number(p.homeWin || 0),
        draw: Number(p.draw || 0),
        awayWin: Number(p.awayWin || 0),
        over25,
        bttsYes: btts,
        over15,
        under35,
      });

      return {
        id: p.id,
        match: `${p.match.homeTeam?.name} vs ${p.match.awayTeam?.name}`,
        league: p.match.league?.name || "Unknown",
        kickoff: p.match.kickoff,
        market: bestTip.market,
        pick: bestTip.pick,
        probability: bestTip.probability,
        confidence: oddsRows > 0 ? "Verifizierter Pick" : "KI-Prognose",
        valueScore: Math.round(bestTip.score || p.valueScore || 0),
        oddsRows,
        over15,
        under35,
        over25,
        btts,
        qualityScore: Number(bestTip.score || bestTip.probability || 0) + oddsRows,
      };
    })
    .filter((p) => p.probability >= 45)
    .sort((a, b) => b.qualityScore - a.qualityScore);

  const withOdds = ranked.filter((p) => p.oddsRows > 0);
  const withoutOdds = ranked.filter((p) => p.oddsRows <= 0);
  const seenMatches = new Set();

  const picks = [...withOdds, ...withoutOdds]
    .filter((p) => {
      const key = p.match.toLowerCase();

      if (seenMatches.has(key)) {
        return false;
      }

      seenMatches.add(key);
      return true;
    })
    .slice(0, 10);

  const lastUpdated = new Date().toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

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
              Jeden Tag 3 bis 10 ausgewählte Fußballprognosen. Zusätzlich zeigen wir pro Spiel
              die Modellwahrscheinlichkeiten für Über 1,5 und Unter 3,5 Tore.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <Stat label="Angezeigte Picks" value={picks.length} />
              <Stat label="Ziel pro Tag" value="3–10" />
              <Stat label="Mit Quoten" value={picks.filter((p) => p.oddsRows > 0).length} />
              <Stat label="Update" value={lastUpdated} />
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
                over15={p.over15}
                under35={p.under35}
                over25={p.over25}
                btts={p.btts}
              />
            ))}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-white">
            <h2 className="text-2xl font-black">Heute keine Spiele verfügbar</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400">
              Es wurden keine kommenden Spiele im 3-Tage-Fenster gefunden.
              Bitte prüfe den Fixture-Sync.
            </p>
          </section>
        )}

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-2xl font-black">
            Wie wird der beste Tipp gewählt?
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
            Für jedes Spiel berechnet Football IQ mehrere Märkte: Heimsieg,
            Auswärtssieg, Über 1,5, Über 2,5, Unter 3,5 und Beide Teams treffen.
            Angezeigt wird der Tipp mit der besten Kombination aus Wahrscheinlichkeit,
            Marktwert und Modellbewertung.
          </p>
        </section>
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
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
