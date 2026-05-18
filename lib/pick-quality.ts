function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function filterElitePicks(predictions: any[]) {
  return predictions.filter((p) => {
    const prob = Number(p.bestProbability || 0);
    const edge = Number(p.edge || 0);
    const tuned = Number(p.tunedScore || 0);

    // harte Mindestqualität
    if (prob < 57) return false;

    // schlechte edges raus
    if (edge < -2) return false;

    // low quality raus
    if (tuned < 16) return false;

    // Over 2.5 performt aktuell schlecht: nur sehr starke Over-Picks zulassen
    if (p.bestMarket === "Über 2.5 Tore" && (prob < 72 || tuned < 38)) {
      return false;
    }

    // Under 2.5 nur mit höherer Sicherheit
    if (p.bestMarket === "Unter 2.5 Tore" && (prob < 66 || tuned < 28)) {
      return false;
    }

    // BTTS nur wenn wirklich stabil
    if (
      p.bestMarket.includes("Beide") &&
      (prob < 59 || tuned < 22)
    ) {
      return false;
    }

    return true;
  });
}

export function rankElitePicks(predictions: any[]) {
  return [...predictions].sort((a, b) => {
    const scoreA =
      Number(a.tunedScore || 0) * 1.4 +
      Number(a.edge || 0) * 1.1 +
      Number(a.bestProbability || 0) * 0.45 +
      (a.bestMarket === "Sieg Heim" ? 16 : 0) +
      (a.bestMarket === "Sieg Auswärts" ? 6 : 0) -
      (a.bestMarket === "Über 2.5 Tore" ? 18 : 0) -
      (a.bestMarket === "Unter 2.5 Tore" ? 6 : 0);

    const scoreB =
      Number(b.tunedScore || 0) * 1.4 +
      Number(b.edge || 0) * 1.1 +
      Number(b.bestProbability || 0) * 0.45 +
      (b.bestMarket === "Sieg Heim" ? 16 : 0) +
      (b.bestMarket === "Sieg Auswärts" ? 6 : 0) -
      (b.bestMarket === "Über 2.5 Tore" ? 18 : 0) -
      (b.bestMarket === "Unter 2.5 Tore" ? 6 : 0);

    return scoreB - scoreA;
  });
}
