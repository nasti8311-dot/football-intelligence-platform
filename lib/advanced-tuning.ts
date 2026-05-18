function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function bucket(market: string) {
  if (market.includes("Sieg") || market.includes("Unentschieden")) return "1X2";
  if (market.includes("2.5")) return "TOTALS";
  if (market.includes("Beide")) return "BTTS";
  return "OTHER";
}

export function advancedTune(predictions: any[], calibrationRows: any[] = [], leagueRows: any[] = []) {
  const marketCal = new Map<string, any>();
  const leagueCal = new Map<string, any>();

  for (const r of calibrationRows) marketCal.set(String(r.market), r);
  for (const r of leagueRows) leagueCal.set(String(r.league), r);

  return predictions
    .map((p) => {
      const market = bucket(p.bestMarket);
      const m = marketCal.get(market);
      const l = leagueCal.get(p.league);

      const marketSample = Number(m?.sampleSize || 0);
      const leagueSample = Number(l?.sampleSize || 0);

      const marketAcc = Number(m?.accuracy || 0);
      const marketRoi = Number(m?.roi || 0);
      const leagueAcc = Number(l?.accuracy || 0);
      const leagueRoi = Number(l?.roi || 0);

      const marketAdjustment =
        marketSample >= 8
          ? clamp((marketAcc - 52) * 0.22 + marketRoi * 0.08, -8, 10)
          : 0;

      const leagueAdjustment =
        leagueSample >= 8
          ? clamp((leagueAcc - 52) * 0.18 + leagueRoi * 0.06, -6, 8)
          : 0;

      const edge = Number(p.edge || 0);
      const edgeAdjustment = edge > 0 ? clamp(edge * 1.25, 0, 18) : clamp(edge * 0.7, -8, 0);

      const riskPenalty = Number(p.injuryPenalty || 0) * 55;
      const lowProbPenalty = Number(p.bestProbability || 0) < 57 ? 8 : 0;

      const trendBonus = Array.isArray(p.trends)
        ? Math.min(p.trends.length * 1.25, 6)
        : 0;

      const tunedScore = Math.round(
        Number(p.premiumScore ?? p.valueScore ?? 0) +
          marketAdjustment +
          leagueAdjustment +
          edgeAdjustment +
          trendBonus -
          riskPenalty -
          lowProbPenalty
      );

      let recommendation = "Lean";
      if (tunedScore >= 42 && Number(p.bestProbability) >= 64) recommendation = "Elite";
      else if (tunedScore >= 34 && Number(p.bestProbability) >= 61) recommendation = "Premium";
      else if (tunedScore >= 25 && Number(p.bestProbability) >= 58) recommendation = "Strong";

      return {
        ...p,
        tunedScore,
        recommendation,
        marketCalibration: marketSample >= 8 ? `${Math.round(marketAcc)}% / ROI ${Math.round(marketRoi)}%` : null,
        leagueCalibration: leagueSample >= 8 ? `${Math.round(leagueAcc)}% / ROI ${Math.round(leagueRoi)}%` : null,
      };
    })
    .sort((a, b) => {
      if (b.tunedScore !== a.tunedScore) return b.tunedScore - a.tunedScore;
      if ((b.edge ?? -999) !== (a.edge ?? -999)) return (b.edge ?? -999) - (a.edge ?? -999);
      return b.bestProbability - a.bestProbability;
    });
}
