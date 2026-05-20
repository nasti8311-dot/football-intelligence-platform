import type { TeamRating } from "@/lib/team-rating-engine";

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
  dataQuality: "LOW" | "MEDIUM" | "HIGH";
};

function clamp(value: number, min = 1, max = 99) {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number, min = 1, max = 99) {
  return clamp(Math.round(value * 100), min, max);
}

function factorial(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poisson(lambda: number, goals: number) {
  return (Math.exp(-lambda) * Math.pow(lambda, goals)) / factorial(goals);
}

function normalizeOdds(odds?: OddsLike[]) {
  const valid =
    odds?.filter(
      (o) =>
        Number(o.homeOdds) > 1 &&
        Number(o.drawOdds) > 1 &&
        Number(o.awayOdds) > 1
    ) || [];

  if (!valid.length) return null;

  const avg = valid.reduce(
    (
      acc: { homeOdds: number; drawOdds: number; awayOdds: number },
      o
    ) => ({
      homeOdds: acc.homeOdds + Number(o.homeOdds),
      drawOdds: acc.drawOdds + Number(o.drawOdds),
      awayOdds: acc.awayOdds + Number(o.awayOdds),
    }),
    { homeOdds: 0, drawOdds: 0, awayOdds: 0 }
  );

  avg.homeOdds /= valid.length;
  avg.drawOdds /= valid.length;
  avg.awayOdds /= valid.length;

  const h = 1 / avg.homeOdds;
  const d = 1 / avg.drawOdds;
  const a = 1 / avg.awayOdds;
  const total = h + d + a;

  return {
    home: h / total,
    draw: d / total,
    away: a / total,
  };
}

function scoreMatrix(homeXg: number, awayXg: number) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let btts = 0;
  let over15 = 0;
  let over25 = 0;
  let under25 = 0;
  let under35 = 0;

  for (let h = 0; h <= 12; h++) {
    for (let a = 0; a <= 12; a++) {
      const p = poisson(homeXg, h) * poisson(awayXg, a);
      const goals = h + a;

      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;

      if (h > 0 && a > 0) btts += p;
      if (goals >= 2) over15 += p;
      if (goals >= 3) over25 += p;
      if (goals <= 2) under25 += p;
      if (goals <= 3) under35 += p;
    }
  }

  return { homeWin, draw, awayWin, btts, over15, over25, under25, under35 };
}

export function calculateFootballProbabilities(
  match: any,
  ratings?: {
    home?: TeamRating;
    away?: TeamRating;
  }
): FootballProbabilities {
  const odds = normalizeOdds(match?.odds);

  const home = ratings?.home;
  const away = ratings?.away;

  const hasEnoughFormData =
    Boolean(home && away) &&
    (home?.sampleSize || 0) >= 5 &&
    (away?.sampleSize || 0) >= 5;

  const hasOdds = Boolean(odds);

  if (!hasOdds && !hasEnoughFormData) {
    return {
      homeWin: 0,
      draw: 0,
      awayWin: 0,
      btts: 0,
      over15: 0,
      over25: 0,
      under25: 0,
      under35: 0,
      dataQuality: "LOW",
    };
  }

  const dataQuality =
    hasOdds && hasEnoughFormData ? "HIGH" : hasOdds ? "MEDIUM" : "MEDIUM";

  let homeXg = 1.35;
  let awayXg = 1.1;

  if (hasEnoughFormData && home && away) {
    homeXg =
      1.35 *
      home.attack *
      (1 / Math.max(0.75, away.defense)) *
      home.homeAdvantage *
      (1 + home.form * 0.1);

    awayXg =
      1.1 *
      away.attack *
      (1 / Math.max(0.75, home.defense)) *
      (1 + away.form * 0.08);
  }

  homeXg = Math.min(3.2, Math.max(0.55, homeXg));
  awayXg = Math.min(3.0, Math.max(0.45, awayXg));

  const model = scoreMatrix(homeXg, awayXg);

  const totalModel = model.homeWin + model.draw + model.awayWin;

  let homeWin = model.homeWin / totalModel;
  let draw = model.draw / totalModel;
  let awayWin = model.awayWin / totalModel;

  if (odds) {
    const oddsWeight = hasEnoughFormData ? 0.7 : 0.9;

    homeWin = homeWin * (1 - oddsWeight) + odds.home * oddsWeight;
    draw = draw * (1 - oddsWeight) + odds.draw * oddsWeight;
    awayWin = awayWin * (1 - oddsWeight) + odds.away * oddsWeight;
  }

  const total1x2 = homeWin + draw + awayWin;

  homeWin /= total1x2;
  draw /= total1x2;
  awayWin /= total1x2;

  return {
    homeWin: pct(homeWin, 3, 85),
    draw: pct(draw, 8, 38),
    awayWin: pct(awayWin, 3, 85),
    btts: pct(model.btts, 20, 80),
    over15: pct(model.over15, 25, 92),
    over25: pct(model.over25, 15, 82),
    under25: pct(model.under25, 18, 85),
    under35: pct(model.under35, 30, 92),
    dataQuality,
  };
}
