import type { FootballProbabilities } from "@/lib/probability-engine";
import type { TeamRating } from "@/lib/team-rating-engine";

export type PredictionExplanation = {
  headline: string;
  factors: string[];
};

export function explainPrediction({
  probs,
  home,
  away,
}: {
  probs: FootballProbabilities;
  home?: TeamRating;
  away?: TeamRating;
}): PredictionExplanation {
  const factors: string[] = [];

  if (home && away) {
    if (home.attack > away.attack + 0.12) {
      factors.push("Heimteam mit stärkerem Angriff");
    }

    if (away.attack > home.attack + 0.12) {
      factors.push("Auswärtsteam offensiv stärker");
    }

    if (home.defense > away.defense + 0.12) {
      factors.push("Heimteam defensiv stabiler");
    }

    if (away.defense > home.defense + 0.12) {
      factors.push("Auswärtsteam defensiv stabiler");
    }

    if (home.form > 0.12) {
      factors.push("Positive Heimteam-Form");
    }

    if (away.form > 0.12) {
      factors.push("Positive Auswärtsteam-Form");
    }
  }

  if (probs.over25 >= 58) {
    factors.push("Klare Over-2,5-Tendenz");
  }

  if (probs.under35 >= 72) {
    factors.push("Unter-3,5 wirkt stabil");
  }

  if (probs.btts >= 58) {
    factors.push("BTTS-Signal überdurchschnittlich");
  }

  if (factors.length === 0) {
    factors.push("Ausgeglichenes Matchprofil");
    factors.push("Kein extremes Risiko-Signal");
  }

  return {
    headline: factors[0],
    factors: factors.slice(0, 4),
  };
}
