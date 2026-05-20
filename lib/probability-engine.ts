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

function leagueProfile(name?: string | null) {
  const n = (name || "").toLowerCase();

  if (n.includes("eredivisie")) return { goals: 3.1, draw: 0.22 };
  if (n.includes("bundesliga")) return { goals: 2.95, draw: 0.24 };
  if (n.includes("champions")) return { goals: 2.85, draw: 0.24 };
  if (n.includes("mls")) return { goals: 2.9, draw: 0.24 };
  if (n.includes("premier") || n.includes("epl")) return { goals: 2.75, draw: 0.25 };
  if (n.includes("liga")) return { goals: 2.55, draw: 0.27 };
  if (n.includes("serie")) return { goals: 2.45, draw: 0.27 };
  if (n.includes("ligue")) return { goals: 2.5, draw: 0.28 };

  return { goals: 2.65, draw: 0.26 };
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

  const home = ratings?.home || {
    attack: 1,
    defense: 1,
    form: 0,
    homeAdvantage: 1.08,
    sampleSize: 0,
  };

  const away = ratings?.away || {
    attack: 1,
    defense: 1,
    form: 0,
    homeAdvantage: 1.08,
    sampleSize: 0,
  };

  const homePower =
    home.attack * (1 / Math.max(0.75, away.defense)) * home.homeAdvantage * (1 + home.form * 0.12);

  const awayPower =
    away.attack * (1 / Math.max(0.75, home.defense)) * 0.96 * (1 + away.form * 0.1);

  const totalPower = homePower + awayPower;
  const homeShare = homePower / Math.max(0.01, totalPower);

  let totalGoals = profile.goals;

  const mismatch = Math.abs(homeShare - 0.5);
  if (mismatch > 0.16) totalGoals += 0.15;
  if (mismatch < 0.06) totalGoals -= 0.08;

  let homeXg = totalGoals * homeShare;
  let awayXg = totalGoals * (1 - homeShare);

  homeXg = Math.min(3.2, Math.max(0.7, homeXg));
  awayXg = Math.min(3.0, Math.max(0.55, awayXg));

  const model = scoreMatrix(homeXg, awayXg);

  const modelTotal = model.homeWin + model.draw + model.awayWin;

  let homeWin = model.homeWin / modelTotal;
  let draw = model.draw / modelTotal;
  let awayWin = model.awayWin / modelTotal;

  if (odds) {
    const oddsWeight = 0.68;
    homeWin = homeWin * (1 - oddsWeight) + odds.home * oddsWeight;
    draw = draw * (1 - oddsWeight) + odds.draw * oddsWeight;
    awayWin = awayWin * (1 - oddsWeight) + odds.away * oddsWeight;
  }

  const drawCap =
    mismatch > 0.18 ? 0.25 :
    mismatch > 0.1 ? 0.29 :
    0.34;

  draw = Math.min(draw, drawCap);

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
    draw: pct(draw, 12, 34),
    awayWin: pct(awayWin, 6, 72),
    btts,
    over15,
    over25,
    under25,
    under35,
  };
}
