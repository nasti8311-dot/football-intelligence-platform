import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { MatchPrediction } from "@/lib/types/football";

export async function savePrediction(prediction: MatchPrediction, matchId?: string) {
  return prisma.prediction.create({
    data: {
      matchId,
      homeTeamId: prediction.homeTeam.id,
      awayTeamId: prediction.awayTeam.id,
      expectedHomeGoals: prediction.expectedGoals.home,
      expectedAwayGoals: prediction.expectedGoals.away,
      homeWinProb: prediction.outcomes.homeWin,
      drawProb: prediction.outcomes.draw,
      awayWinProb: prediction.outcomes.awayWin,
      coveredMass: prediction.coveredMass,
      config: prediction.config as unknown as Prisma.InputJsonValue,
      breakdown: prediction.breakdown as unknown as Prisma.InputJsonValue,
      scorelines: {
        create: prediction.scoreMatrix.map((score) => ({
          homeGoals: score.homeGoals,
          awayGoals: score.awayGoals,
          probability: score.probability,
        })),
      },
      markets: {
        create: prediction.markets.map((market) => ({
          label: market.label,
          probability: market.probability,
          fairOdds: market.fairOdds,
          explanation: market.explanation,
        })),
      },
    },
    include: { scorelines: true, markets: true },
  });
}

export async function listRecentPredictions(limit = 20) {
  return prisma.prediction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { scorelines: true, markets: true, match: true },
  });
}
