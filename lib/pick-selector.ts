import type { FootballProbabilities } from "@/lib/probability-engine";

export type SelectedPick = {
  label: string;
  probability: number;
  risk: "NIEDRIG" | "MITTEL" | "HOCH";
  score: number;
  reason: string;
};

function score(probability: number, penalty: number, bonus = 0) {
  return probability - penalty + bonus;
}

export function selectBestPick(probs: FootballProbabilities): SelectedPick {
  const candidates: SelectedPick[] = [
    {
      label: "Heimsieg",
      probability: probs.homeWin,
      risk: probs.homeWin >= 58 ? "MITTEL" : "HOCH",
      score: score(probs.homeWin, 4, 8),
      reason: "Heimsiege performen in der bisherigen Kalibrierung am stärksten.",
    },
    {
      label: "Auswärtssieg",
      probability: probs.awayWin,
      risk: probs.awayWin >= 56 ? "MITTEL" : "HOCH",
      score: score(probs.awayWin, 7, 4),
      reason: "Auswärtssiege sind solide, aber stärker risikobehaftet als Heimsiege.",
    },
    {
      label: "Beide Teams treffen",
      probability: probs.btts,
      risk: probs.btts >= 58 ? "MITTEL" : "HOCH",
      score: score(probs.btts, 7, 3),
      reason: "BTTS zeigt bisher brauchbare Performance, bleibt aber torabhängig.",
    },
    {
      label: "Unter 2,5 Tore",
      probability: probs.under25,
      risk: probs.under25 >= 60 ? "MITTEL" : "HOCH",
      score: score(probs.under25, probs.under25 >= 60 ? 10 : 17),
      reason: "Unter 2,5 wird nur bei klarer Modellwahrscheinlichkeit empfohlen.",
    },
    {
      label: "Über 2,5 Tore",
      probability: probs.over25,
      risk: "HOCH",
      score: score(probs.over25, 24),
      reason: "Über 2,5 wird aktuell wegen schwacher historischer Performance stark abgewertet.",
    },
    {
      label: "Über 1,5 Tore",
      probability: probs.over15,
      risk: "NIEDRIG",
      score: score(probs.over15, 22),
      reason: "Über 1,5 ist stabil, aber häufig kein echter Value-Markt.",
    },
    {
      label: "Remis",
      probability: probs.draw,
      risk: "HOCH",
      score: score(probs.draw, 26),
      reason: "Remis bleibt ein volatiler Markt und wird nur selten empfohlen.",
    },
  ];

  return candidates.sort((a, b) => b.score - a.score)[0];
}
