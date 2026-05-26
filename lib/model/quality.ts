export function calculatePredictionQuality(data: {
  probability: number;
  valueScore: number;
  oddsRows?: number;
  market: string;
}) {
  const probability = Number(data.probability || 0);
  const value = Number(data.valueScore || 0);
  const odds = Number(data.oddsRows || 0);

  let score = 0;

  score += probability * 0.55;
  score += value * 0.30;
  score += Math.min(odds * 2, 15);

  // starke Märkte bevorzugen
  const market = String(data.market || "").toLowerCase();

  if (market.includes("heimsieg")) score += 4;
  if (market.includes("unter 3,5")) score += 3;
  if (market.includes("über 2,5")) score += 2;

  return Math.round(score);
}

export function isElitePrediction(score: number) {
  return score >= 78;
}
