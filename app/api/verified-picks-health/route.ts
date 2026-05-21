import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTeamRatings, getTeamRating } from "@/lib/team-rating-engine";
import { buildEloRatings, getEloRating } from "@/lib/elo-engine";
import { calculateFootballProbabilities } from "@/lib/probability-engine";
import { selectBestPick } from "@/lib/pick-selector";
import { isVerifiedPick } from "@/lib/verified-picks";

export const dynamic = "force-dynamic";

export async function GET() {
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
      bookmakerOdds: true,
      odds: true,
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

  let verified = 0;
  let rejected = 0;

  const samples = [];

  for (const match of matches) {
    const ratings = {
      home: getTeamRating(teamRatings, match.homeTeamId),
      away: getTeamRating(teamRatings, match.awayTeamId),
    };

    const elo = {
      home: getEloRating(eloRatings, match.homeTeamId),
      away: getEloRating(eloRatings, match.awayTeamId),
    };

    const probs = await calculateFootballProbabilities(match, ratings, elo);
    const bestPick = selectBestPick(probs);
    const isVerified = isVerifiedPick(bestPick.label, probs);

    if (isVerified) verified++;
    else rejected++;

    samples.push({
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      league: match.league?.name,
      pick: bestPick.label,
      probability: bestPick.probability,
      verified: isVerified,
      dataQuality: probs.dataQuality,
      oddsRows:
        (match.bookmakerOdds?.length || 0) +
        (match.odds?.length || 0),
    });
  }

  return NextResponse.json({
    totalUpcoming: matches.length,
    verified,
    rejected,
    samples: samples.slice(0, 25),
  });
}
