import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [
    totalMatches,
    upcomingMatches,
    finishedMatches,
    oddsRows,
    teams,
  ] = await Promise.all([
    prisma.match.count(),
    prisma.match.count({
      where: {
        kickoff: {
          gte: new Date(),
        },
      },
    }),
    prisma.match.count({
      where: {
        homeGoals: {
          not: null,
        },
        awayGoals: {
          not: null,
        },
      },
    }),
    prisma.matchOdds.count(),
    prisma.team.count(),
  ]);

  return NextResponse.json({
    totalMatches,
    upcomingMatches,
    finishedMatches,
    oddsRows,
    teams,
    predictionReadiness: {
      hasUpcomingMatches: upcomingMatches > 0,
      hasFinishedMatches: finishedMatches >= 50,
      hasOdds: oddsRows >= 20,
      ready:
        upcomingMatches > 0 &&
        (finishedMatches >= 50 || oddsRows >= 20),
    },
  });
}
