import type { FootballProbabilities } from "@/lib/probability-engine";

export function isVerifiedPick(
  pick: string,
  probs: FootballProbabilities,
  oddsRows = 0
) {
  if (oddsRows <= 0) return false;
  if (probs.dataQuality === "LOW") return false;

  const p = normalize(getProbability(pick, probs));

  if (pick === "Heimsieg") return p >= 0.58;
  if (pick === "Auswärtssieg") return p >= 0.60;
  if (pick === "Beide Teams treffen") return p >= 0.60;
  if (pick === "Unter 2,5 Tore") return p >= 0.63;
  if (pick === "Über 2,5 Tore") return p >= 0.70;
  if (pick === "Über 1,5 Tore") return p >= 0.72;

  return false;
}

function normalize(v: number) {
  return v > 1 ? v / 100 : v;
}

function getProbability(
  pick: string,
  probs: FootballProbabilities
) {
  switch (pick) {
    case "Heimsieg":
      return probs.homeWin;
    case "Auswärtssieg":
      return probs.awayWin;
    case "Beide Teams treffen":
      return probs.btts;
    case "Unter 2,5 Tore":
      return probs.under25;
    case "Über 2,5 Tore":
      return probs.over25;
    case "Über 1,5 Tore":
      return probs.over15;
    default:
      return 0;
  }
}
