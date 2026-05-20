import type { FootballProbabilities } from "@/lib/probability-engine";

export type SelectedPick = {
  label: string;
  probability: number;
  risk: "NIEDRIG" | "MITTEL" | "HOCH";
  score: number;
  reason: string;
};

function marketScore(probability: number, riskPenalty: number, boringPenalty = 0) {
  return probability - riskPenalty - boringPenalty;
}

export function selectBestPick(probs: FootballProbabilities): SelectedPick {
  const candidates: SelectedPick[] = [
    {
      label: "Heimsieg",
      probability: probs.homeWin,
      risk: probs.homeWin >= 52 ? "MITTEL" : "HOCH",
      score: marketScore(probs.homeWin, probs.homeWin >= 52 ? 8 : 16),
      reason: "Heimsieg hat im Modell das stärkste 1X2-Signal.",
    },
    {
      label: "Remis",
      probability: probs.draw,
      risk: "HOCH",
      score: marketScore(probs.draw, 20),
      reason: "Remis bleibt grundsätzlich ein volatiler Markt.",
    },
    {
      label: "Auswärtssieg",
      probability: probs.awayWin,
      risk: probs.awayWin >= 50 ? "MITTEL" : "HOCH",
      score: marketScore(probs.awayWin, probs.awayWin >= 50 ? 10 : 18),
      reason: "Auswärtssieg wird nur bei klarem Modellvorteil bevorzugt.",
    },
    {
      label: "Beide Teams treffen",
      probability: probs.btts,
      risk: probs.btts >= 58 ? "MITTEL" : "HOCH",
      score: marketScore(probs.btts, probs.btts >= 58 ? 7 : 14),
      reason: "BTTS wird bevorzugt, wenn beide Offensiven stabil wirken.",
    },
    {
      label: "Über 1,5 Tore",
      probability: probs.over15,
      risk: "NIEDRIG",
      score: marketScore(probs.over15, 4, probs.over15 > 82 ? 8 : 2),
      reason: "Über 1,5 ist ein stabiler Markt, wird aber wegen geringer Quote leicht abgewertet.",
    },
    {
      label: "Über 2,5 Tore",
      probability: probs.over25,
      risk: probs.over25 >= 56 ? "MITTEL" : "HOCH",
      score: marketScore(probs.over25, probs.over25 >= 56 ? 8 : 15),
      reason: "Über 2,5 wird nur bei klarer Tor-Tendenz empfohlen.",
    },
    {
      label: "Unter 2,5 Tore",
      probability: probs.under25,
      risk: probs.under25 >= 56 ? "MITTEL" : "HOCH",
      score: marketScore(probs.under25, probs.under25 >= 56 ? 8 : 15),
      reason: "Unter 2,5 passt bei defensiver oder ausgeglichener Spielstruktur.",
    },
    {
      label: "Unter 3,5 Tore",
      probability: probs.under35,
      risk: "NIEDRIG",
      score: marketScore(probs.under35, 5, probs.under35 > 84 ? 7 : 2),
      reason: "Unter 3,5 ist stabil, wird aber bei sehr hoher Grundwahrscheinlichkeit abgewertet.",
    },
  ];

  return candidates.sort((a, b) => b.score - a.score)[0];
}
