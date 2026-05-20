type OddsLike = {
  homeOdds?: number | null;
  drawOdds?: number | null;
  awayOdds?: number | null;
};

export type FootballProbabilities = {
  homeWin: number;
  draw: number;
  awayWin: number;
  btts: number;
  over15: number;
  over25: number;
  under25: number;
  under35: number;
};

function clamp(value: number, min = 1, max = 99) {
  return Math.min(max, Math.max(min, value));
}

function poisson(lambda: number, goals: number) {
  return (Math.exp(-lambda) * Math.pow(lambda, goals)) / factorial(goals);
}

function factorial(n: number) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function normalizeOdds(odds?: OddsLike[]) {
  const first = odds?.find(
    (o) => o.homeOdds && o.drawOdds && o.awayOdds
  );

  if (!first?.homeOdds || !first?.drawOdds || !first?.awayOdds) {
    return null;
  }

  const h = 1 / first.homeOdds;
  const d = 1 / first.drawOdds;
  const a = 1 / first.awayOdds;
  const total = h + d + a;

  return {
    home: h / total,
    draw: d / total,
    away: a / total,
  };
}

export function calculateFootballProbabilities(match: any): FootballProbabilities {
  const oddsProb = normalizeOdds(match?.odds);

  const baseHome = oddsProb?.home ?? 0.45;
  const baseDraw = oddsProb?.draw ?? 0.27;
  const baseAway = oddsProb?.away ?? 0.28;

  const strengthDiff = baseHome - baseAway;

  let homeXg =
    1.35 +
    strengthDiff * 1.15 +
    (match?.stats?.homeXgProxy ?? 0) * 0.08;

  let awayXg =
    1.05 -
    strengthDiff * 0.95 +
    (match?.stats?.awayXgProxy ?? 0) * 0.08;

  homeXg = Math.min(3.2, Math.max(0.35, homeXg));
  awayXg = Math.min(3.0, Math.max(0.25, awayXg));

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let btts = 0;
  let over15 = 0;
  let over25 = 0;
  let under25 = 0;
  let under35 = 0;

  for (let h = 0; h <= 8; h++) {
    for (let a = 0; a <= 8; a++) {
      const p = poisson(homeXg, h) * poisson(awayXg, a);
      const totalGoals = h + a;

      if (h > a) homeWin += p;
      if (h === a) draw += p;
      if (a > h) awayWin += p;

      if (h > 0 && a > 0) btts += p;
      if (totalGoals >= 2) over15 += p;
      if (totalGoals >= 3) over25 += p;
      if (totalGoals <= 2) under25 += p;
      if (totalGoals <= 3) under35 += p;
    }
  }

  const modelWeight = oddsProb ? 0.7 : 0;

  homeWin = homeWin * (1 - modelWeight) + baseHome * modelWeight;
  draw = draw * (1 - modelWeight) + baseDraw * modelWeight;
  awayWin = awayWin * (1 - modelWeight) + baseAway * modelWeight;

  const total1x2 = homeWin + draw + awayWin;

  return {
    homeWin: clamp(Math.round((homeWin / total1x2) * 100)),
    draw: clamp(Math.round((draw / total1x2) * 100)),
    awayWin: clamp(Math.round((awayWin / total1x2) * 100)),
    btts: clamp(Math.round(btts * 100)),
    over15: clamp(Math.round(over15 * 100)),
    over25: clamp(Math.round(over25 * 100)),
    under25: clamp(Math.round(under25 * 100)),
    under35: clamp(Math.round(under35 * 100)),
  };
}
