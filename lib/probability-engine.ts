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
};

function clamp(value: number, min = 1, max = 99) {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number, min = 3, max = 97) {
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

function leagueProfile(name?: string | null) {
  const n = (name || "").toLowerCase();

  if (n.includes("eredivisie")) return { goals: 3.15, draw: 0.23 };
  if (n.includes("bundesliga")) return { goals: 3.0, draw: 0.24 };
  if (n.includes("champions")) return { goals: 2.9, draw: 0.25 };
  if (n.includes("mls")) return { goals: 2.95, draw: 0.24 };
  if (n.includes("premier") || n.includes("epl")) return { goals: 2.85, draw: 0.25 };
  if (n.includes("liga")) return { goals: 2.65, draw: 0.27 };
  if (n.includes("serie")) return { goals: 2.55, draw: 0.28 };
  if (n.includes("ligue")) return { goals: 2.6, draw: 0.28 };

  return { goals: 2.75, draw: 0.26 };
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
  const profile = leagueProfile(match?.league?.name);

  const homeRating = ratings?.home || {
    attack: 1,
    defense: 1,
    form: 0,
    homeAdvantage: 1.08,
    sampleSize: 0,
  };

  const awayRating = ratings?.away || {
    attack: 1,
    defense: 1,
    form: 0,
    homeAdvantage: 1.08,
    sampleSize: 0,
  };

  const dataConfidence = Math.min(
    1,
    (homeRating.sampleSize + awayRating.sampleSize) / 24
  );

  const homeAttackEdge = homeRating.attack / Math.max(0.75, awayRating.defense);
  const awayAttackEdge = awayRating.attack / Math.max(0.75, homeRating.defense);

  let homeXg =
    (profile.goals * 0.53) *
    homeAttackEdge *
    homeRating.homeAdvantage *
    (1 + homeRating.form * 0.12);

  let awayXg =
    (profile.goals * 0.47) *
    awayAttackEdge *
    0.98 *
    (1 + awayRating.form * 0.1);

  const totalBefore = homeXg + awayXg;
  const targetGoals =
    profile.goals *
    (0.85 + dataConfidence * 0.15);

  const scale = targetGoals / Math.max(1.8, totalBefore);

  homeXg *= scale;
  awayXg *= scale;

  homeXg = Math.min(3.1, Math.max(0.75, homeXg));
  awayXg = Math.min(2.9, Math.max(0.55, awayXg));

  const model = scoreMatrix(homeXg, awayXg);

  const modelTotal = model.homeWin + model.draw + model.awayWin;

  let homeWin = model.homeWin / modelTotal;
  let draw = model.draw / modelTotal;
  let awayWin = model.awayWin / modelTotal;

  if (odds) {
    const oddsWeight = 0.55 + dataConfidence * 0.18;

    homeWin = homeWin * (1 - oddsWeight) + odds.home * oddsWeight;
    draw = draw * (1 - oddsWeight) + odds.draw * oddsWeight;
    awayWin = awayWin * (1 - oddsWeight) + odds.away * oddsWeight;
  } else {
    draw = draw * 0.85 + profile.draw * 0.15;
  }

  const total1x2 = homeWin + draw + awayWin;

  homeWin /= total1x2;
  draw /= total1x2;
  awayWin /= total1x2;

  const over15 = pct(model.over15, 35, 92);
  const over25 = pct(model.over25, 18, 78);
  const under25 = clamp(100 - over25, 22, 82);
  const under35 = pct(model.under35, 42, 88);
  const btts = pct(model.btts, 28, 76);

  return {
    homeWin: pct(homeWin, 8, 78),
    draw: pct(draw, 12, 38),
    awayWin: pct(awayWin, 6, 72),
    btts,
    over15,
    over25,
    under25,
    under35,
  };
}
