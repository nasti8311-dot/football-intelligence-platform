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
    market("Home Win", homeWin, "Heimteam gewinnt."),
    market("Draw", draw, "Spiel endet unentschieden."),
    market("Away Win", awayWin, "Auswärtsteam gewinnt."),

    market("Double Chance 1X", homeWin + draw, "Heimteam verliert nicht."),
    market("Double Chance X2", draw + awayWin, "Auswärtsteam verliert nicht."),
    market("Double Chance 12", homeWin + awayWin, "Kein Unentschieden."),

    market(
      "BTTS Yes",
      sum((s) => s.homeGoals > 0 && s.awayGoals > 0),
      "Beide Teams treffen."
    ),

    market(
      "BTTS No",
      sum((s) => s.homeGoals === 0 || s.awayGoals === 0),
      "Mindestens ein Team trifft nicht."
    ),

    market(
      "Over 1.5 Goals",
      sum((s) => s.homeGoals + s.awayGoals >= 2),
      "Mindestens zwei Gesamttore."
    ),

    market(
      "Over 2.5 Goals",
      sum((s) => s.homeGoals + s.awayGoals >= 3),
      "Mindestens drei Gesamttore."
    ),

    market(
      "Over 3.5 Goals",
      sum((s) => s.homeGoals + s.awayGoals >= 4),
      "Mindestens vier Gesamttore."
    ),

    market(
      "Under 2.5 Goals",
      sum((s) => s.homeGoals + s.awayGoals <= 2),
      "Maximal zwei Gesamttore."
    ),

    market(
      "Under 3.5 Goals",
      sum((s) => s.homeGoals + s.awayGoals <= 3),
      "Maximal drei Gesamttore."
    ),

    market(
      "Clean Sheet Home",
      sum((s) => s.awayGoals === 0),
      "Auswärtsteam erzielt kein Tor."
    ),

    market(
      "Clean Sheet Away",
      sum((s) => s.homeGoals === 0),
      "Heimteam erzielt kein Tor."
    ),
  ];
}
