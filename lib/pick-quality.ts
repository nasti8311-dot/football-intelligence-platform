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

    // riskante under/over vermeiden
    if (
      (p.bestMarket === "Über 2.5 Tore" ||
        p.bestMarket === "Unter 2.5 Tore") &&
      prob < 60
    ) {
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
      Number(a.bestProbability || 0) * 0.45;

    const scoreB =
      Number(b.tunedScore || 0) * 1.4 +
      Number(b.edge || 0) * 1.1 +
      Number(b.bestProbability || 0) * 0.45;

    return scoreB - scoreA;
  });
}
