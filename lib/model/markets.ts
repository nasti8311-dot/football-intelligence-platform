import type { BettingMarket, ScoreProbability } from "@/lib/types/football";

function fairOdds(probability: number): number {
  return probability <= 0 ? 0 : Number((1 / probability).toFixed(2));
}

function market(label: string, probability: number, explanation: string): BettingMarket {
  return { label, probability, fairOdds: fairOdds(probability), explanation };
}

export function deriveMarkets(matrix: ScoreProbability[]): BettingMarket[] {
  const sum = (predicate: (score: ScoreProbability) => boolean) =>
    matrix.filter(predicate).reduce((total, score) => total + score.probability, 0);

  const homeWin = sum((s) => s.homeGoals > s.awayGoals);
  const draw = sum((s) => s.homeGoals === s.awayGoals);
  const awayWin = sum((s) => s.homeGoals < s.awayGoals);

  return [
    market("Double Chance 1X", homeWin + draw, "Heimteam verliert nicht."),
    market("Double Chance X2", draw + awayWin, "Auswärtsteam verliert nicht."),
    market("Both Teams To Score", sum((s) => s.homeGoals > 0 && s.awayGoals > 0), "Beide Teams erzielen mindestens ein Tor."),
    market("Over 2.5 Goals", sum((s) => s.homeGoals + s.awayGoals >= 3), "Mindestens drei Gesamttore."),
    market("Under 2.5 Goals", sum((s) => s.homeGoals + s.awayGoals <= 2), "Maximal zwei Gesamttore."),
    market("Clean Sheet Home", sum((s) => s.awayGoals === 0), "Auswärtsteam erzielt kein Tor."),
  ];
}
