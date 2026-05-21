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
      risk: probs.homeWin >= 55 ? "MITTEL" : "HOCH",
      score: score(probs.homeWin, probs.homeWin >= 55 ? 6 : 14),
      reason: "Der Markt zeigt ein klares Heimteam-Signal.",
    },
    {
      label: "Auswärtssieg",
      probability: probs.awayWin,
      risk: probs.awayWin >= 53 ? "MITTEL" : "HOCH",
      score: score(probs.awayWin, probs.awayWin >= 53 ? 7 : 15),
      reason: "Das Auswärtsteam hat ein überdurchschnittliches Sieg-Signal.",
    },
    {
      label: "Beide Teams treffen",
      probability: probs.btts,
      risk: probs.btts >= 58 ? "MITTEL" : "HOCH",
      score: score(probs.btts, probs.btts >= 58 ? 5 : 13),
      reason: "Beide Offensiven zeigen ein brauchbares Tor-Signal.",
    },
    {
      label: "Über 2,5 Tore",
      probability: probs.over25,
      risk: probs.over25 >= 55 ? "MITTEL" : "HOCH",
      score: score(probs.over25, probs.over25 >= 55 ? 6 : 14),
      reason: "Das Modell erkennt eine stärkere Over-2,5-Tendenz.",
    },
    {
      label: "Unter 2,5 Tore",
      probability: probs.under25,
      risk: probs.under25 >= 58 ? "MITTEL" : "HOCH",
      score: score(probs.under25, probs.under25 >= 58 ? 7 : 15),
      reason: "Das Spielprofil wirkt eher defensiv.",
    },
    {
      label: "Über 1,5 Tore",
      probability: probs.over15,
      risk: "NIEDRIG",
      score: score(probs.over15, 18),
      reason: "Über 1,5 ist stabil, aber oft kein starker Value-Tipp.",
    },
    {
      label: "Unter 3,5 Tore",
      probability: probs.under35,
      risk: "NIEDRIG",
      score: score(probs.under35, 24),
      reason: "Unter 3,5 ist stabil, wird aber wegen geringer Aussagekraft stark abgewertet.",
    },
    {
      label: "Remis",
      probability: probs.draw,
      risk: "HOCH",
      score: score(probs.draw, 22),
      reason: "Remis ist volatil und wird nur selten empfohlen.",
    },
  ];

  return candidates.sort((a, b) => b.score - a.score)[0];
}
