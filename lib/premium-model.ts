type CalibrationRow = {
  market: string;
  accuracy?: number | null;
  roi?: number | null;
  sampleSize?: number | null;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function marketBucket(market: string) {
  if (market.includes("Sieg") || market.includes("Unentschieden")) return "1X2";
  if (market.includes("2.5")) return "TOTALS";
  if (market.includes("Beide")) return "BTTS";
  return "OTHER";
}

export function premiumAdjustPredictions(predictions: any[], calibrationRows: CalibrationRow[] = []) {
  const byMarket = new Map<string, CalibrationRow>();

  for (const row of calibrationRows) {
    byMarket.set(row.market, row);
  }

  return predictions
    .map((p) => {
      const bucket = marketBucket(p.bestMarket);
      const cal = byMarket.get(bucket);

      const sampleSize = Number(cal?.sampleSize || 0);
      const accuracy = Number(cal?.accuracy || 0);
      const roi = Number(cal?.roi || 0);

      const hasCalibration = sampleSize >= 10;

      const calibrationBoost = hasCalibration
        ? clamp((accuracy - 52) * 0.35 + roi * 0.12, -12, 14)
        : 0;

      const edgeBoost =
        p.edge !== null && p.edge !== undefined
          ? clamp(Number(p.edge) * 1.4, -10, 18)
          : 0;

      const probabilityQuality = clamp(Number(p.bestProbability || 0) - 50, 0, 25);
      const confidenceBonus =
        p.confidence === "High" ? 8 : p.confidence === "Medium" ? 3 : -5;

      const trendBonus = Array.isArray(p.trends) ? Math.min(p.trends.length * 1.5, 6) : 0;
      const squadPenalty = Number(p.injuryPenalty || 0) * 45;

      const premiumScore = Math.round(
        Number(p.valueScore || 0) * 0.55 +
          probabilityQuality * 1.4 +
          edgeBoost +
          calibrationBoost +
          confidenceBonus +
          trendBonus -
          squadPenalty
      );

      let premiumTier = "Watch";
      if (premiumScore >= 36 && Number(p.bestProbability) >= 62) premiumTier = "Premium";
      else if (premiumScore >= 26 && Number(p.bestProbability) >= 58) premiumTier = "Strong";
      else if (premiumScore >= 18) premiumTier = "Lean";

      const adjustedConfidence =
        premiumTier === "Premium"
          ? "High"
          : premiumTier === "Strong"
          ? "Medium"
          : p.confidence;

      return {
        ...p,
        premiumScore,
        premiumTier,
        confidence: adjustedConfidence,
        marketBucket: bucket,
        calibrationAccuracy: hasCalibration ? accuracy : null,
        calibrationRoi: hasCalibration ? roi : null,
        calibrationSample: sampleSize,
      };
    })
    .sort((a, b) => {
      if (b.premiumScore !== a.premiumScore) return b.premiumScore - a.premiumScore;
      if ((b.edge ?? -999) !== (a.edge ?? -999)) return (b.edge ?? -999) - (a.edge ?? -999);
      return b.bestProbability - a.bestProbability;
    });
}
