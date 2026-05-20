type AnyPick = any;

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function classifyPickRisk(p: AnyPick) {
  const probability = num(p.bestProbability);
  const edge = num(p.edge);
  const odds = num(p.bestOdds || p.odds || p.marketOdds);
  const tuned = num(p.tunedScore ?? p.premiumScore ?? p.valueScore);

  let risk = 0;

  if (probability < 55) risk += 35;
  if (probability < 60) risk += 18;
  if (probability >= 70) risk -= 12;

  if (odds >= 4) risk += 35;
  else if (odds >= 3.2) risk += 22;
  else if (odds >= 2.6) risk += 12;

  if (edge > 18 && probability < 62) risk += 15;

  if (p.bestMarket === "Über 2.5 Tore") risk += 20;
  if (p.bestMarket === "Beide treffen") risk += 6;
  if (p.bestMarket === "Sieg Heim") risk -= 14;
  if (p.bestMarket === "Sieg Auswärts") risk += 4;

  if (tuned >= 35) risk -= 10;
  if (tuned < 15) risk += 12;

  risk = Math.max(0, Math.min(100, Math.round(risk)));

  const tier =
    risk <= 30 && probability >= 62
      ? "SAFE"
      : risk <= 55 && probability >= 58
      ? "BALANCED"
      : "AGGRESSIVE";

  return { risk, tier };
}

export function riskAdjustedScore(p: AnyPick) {
  const probability = num(p.bestProbability);
  const edge = Math.min(num(p.edge), 14);
  const tuned = num(p.tunedScore ?? p.premiumScore ?? p.valueScore);
  const odds = num(p.bestOdds || p.odds || p.marketOdds);
  const { risk, tier } = classifyPickRisk(p);

  let score =
    probability * 0.58 +
    tuned * 0.9 +
    edge * 1.2 -
    risk * 0.85;

  if (tier === "SAFE") score += 24;
  if (tier === "BALANCED") score += 10;
  if (tier === "AGGRESSIVE") score -= 28;

  if (p.bestMarket === "Sieg Heim") score += 18;
  if (p.bestMarket === "Sieg Auswärts") score += 4;
  if (p.bestMarket === "Unter 2.5 Tore") score -= 3;
  if (p.bestMarket === "Über 2.5 Tore") score -= 25;

  if (odds >= 3.5) score -= 25;
  if (odds >= 4.5) score -= 45;

  return Math.round(score);
}

export function filterRiskControlledPicks(picks: AnyPick[]) {
  return picks
    .map((p) => {
      const riskInfo = classifyPickRisk(p);
      const safeScore = riskAdjustedScore(p);

      return {
        ...p,
        riskScore: riskInfo.risk,
        riskTier: riskInfo.tier,
        safeScore,
      };
    })
    .filter((p) => {
      const probability = num(p.bestProbability);
      const odds = num(p.bestOdds || p.odds || p.marketOdds);

      if (probability < 55) return false;
      if (odds >= 4.2) return false;

      if (p.riskTier === "AGGRESSIVE" && probability < 68) return false;

      if (p.bestMarket === "Über 2.5 Tore" && probability < 74) return false;
      if (p.bestMarket === "Unter 2.5 Tore" && probability < 63) return false;
      if (p.bestMarket === "Beide treffen" && probability < 61) return false;

      return true;
    })
    .sort((a, b) => {
      if (a.riskTier !== b.riskTier) {
        const order: any = { SAFE: 0, BALANCED: 1, AGGRESSIVE: 2 };
        return order[a.riskTier] - order[b.riskTier];
      }

      return b.safeScore - a.safeScore;
    });
}
