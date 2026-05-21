import { prisma } from "@/lib/prisma";
import CleanMatchCard from "@/components/picks/CleanMatchCard";
import { filterRiskControlledPicks } from "@/lib/risk-control";
import { buildTeamRatings, getTeamRating } from "@/lib/team-rating-engine";
import { buildEloRatings, getEloRating } from "@/lib/elo-engine";
import { getTeamFormMap } from "@/lib/team-form-service";
import { calculateFootballProbabilities } from "@/lib/probability-engine";
import { selectBestPick } from "@/lib/pick-selector";
import { isVerifiedPick } from "@/lib/verified-picks";

export const dynamic = "force-dynamic";

export default async function VerifiedPicksPage() {
  const now = new Date();
  const in14Days = new Date();
  in14Days.setDate(now.getDate() + 14);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
        lte: in14Days,
      },
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      odds: true,
      bookmakerOdds: true,
      stats: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 120,
  });

  const historicalMatches = await prisma.match.findMany({
    where: {
      homeGoals: { not: null },
      awayGoals: { not: null },
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 3000,
  });

  const teamRatings = buildTeamRatings(historicalMatches);
  const eloRatings = buildEloRatings(historicalMatches);

  const teamIds = matches.flatMap((match) => [
    match.homeTeamId,
    match.awayTeamId,
  ]);

  const teamForms = await getTeamFormMap(teamIds);
  const filteredPicks = filterRiskControlledPicks(matches);

  const verified = [];

  for (const pick of filteredPicks) {
    const ratings = {
      home: getTeamRating(teamRatings, pick.match.homeTeamId),
      away: getTeamRating(teamRatings, pick.match.awayTeamId),
    };

    const elo = {
      home: getEloRating(eloRatings, pick.match.homeTeamId),
      away: getEloRating(eloRatings, pick.match.awayTeamId),
    };

    const probs = await calculateFootballProbabilities(
      pick.match,
      ratings,
      elo
    );

    const bestPick = selectBestPick(probs);

    if (isVerifiedPick(bestPick.label, probs)) {
      verified.push({
        pick,
        ratings,
        elo,
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ verified
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Verifizierte Picks
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Nur Picks, die aktuelle Modellwahrscheinlichkeit und historische Kalibrierung bestehen.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {verified.map((item: any) => (
            <CleanMatchCard
              key={item.pick.match.id}
              p={item.pick}
              ratings={item.ratings}
              forms={{
                home: teamForms.get(item.pick.match.homeTeamId),
                away: teamForms.get(item.pick.match.awayTeamId),
              }}
              elo={item.elo}
            />
          ))}
        </section>

        {verified.length === 0 ? (
          <section className="rounded-[2rem] border border-yellow-400/20 bg-yellow-500/10 p-6 text-yellow-100">
            Aktuell gibt es keine verifizierten Picks. Das ist gewollt: Lieber keine Veröffentlichung als schwache Signale.
          </section>
        ) : null}
      </div>
    </main>
  );
}
