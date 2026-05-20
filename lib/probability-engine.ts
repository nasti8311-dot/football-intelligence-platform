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

function roundPct(value: number) {
  return clamp(Math.round(value * 100));
}

function factorial(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poisson(lambda: number, goals: number) {
  return (Math.exp(-lambda) * Math.pow(lambda, goals)) / factorial(goals);
}

function hashNumber(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return Math.abs(hash >>> 0);
}

function teamRating(name?: string | null) {
  const n = name || "team";
  const h = hashNumber(n);

  let rating = 1.0 + ((h % 100) - 50) / 260;

  const eliteHints = [
    "city",
    "real",
    "barcelona",
    "bayern",
    "psg",
    "liverpool",
    "arsenal",
    "inter",
    "milan",
    "juventus",
    "dortmund",
    "leverkusen",
    "chelsea",
    "atlético",
    "atletico",
    "napoli",
  ];

  if (eliteHints.some((x) => n.toLowerCase().includes(x))) {
    rating += 0.18;
  }

  return Math.min(1.45, Math.max(0.65, rating));
}

function leagueProfile(name?: string | null) {
  const n = (name || "").toLowerCase();

  if (n.includes("eredivisie")) return { goals: 3.05, draw: 0.23 };
  if (n.includes("bundesliga")) return { goals: 2.95, draw: 0.24 };
  if (n.includes("champions")) return { goals: 2.85, draw: 0.25 };
  if (n.includes("mls")) return { goals: 2.9, draw: 0.24 };
  if (n.includes("belg")) return { goals: 2.75, draw: 0.25 };
  if (n.includes("premier") || n.includes("epl")) return { goals: 2.75, draw: 0.25 };
  if (n.includes("liga")) return { goals: 2.55, draw: 0.27 };
  if (n.includes("serie")) return { goals: 2.45, draw: 0.28 };
  if (n.includes("ligue")) return { goals: 2.5, draw: 0.28 };
  if (n.includes("greece") || n.includes("griechen")) return { goals: 2.25, draw: 0.3 };

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

  if (valid.length === 0) return null;

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
  const overround = h + d + a;

  return {
    home: h / overround,
    draw: d / overround,
    away: a / overround,
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

  for (let h = 0; h <= 10; h++) {
    for (let a = 0; a <= 10; a++) {
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

export function calculateFootballProbabilities(match: any): FootballProbabilities {
  const odds = normalizeOdds(match?.odds);

  const homeName = match?.homeTeam?.name || "home";
  const awayName = match?.awayTeam?.name || "away";
  const leagueName = match?.league?.name || "league";

  const profile = leagueProfile(leagueName);
  const homeRating = teamRating(homeName) * 1.08;
  const awayRating = teamRating(awayName);

  const totalRating = homeRating + awayRating;
  const ratingHomeShare = homeRating / totalRating;
  const ratingAwayShare = awayRating / totalRating;

  const marketHome = odds?.home ?? ratingHomeShare * (1 - profile.draw);
  const marketDraw =
    odds?.draw ??
    profile.draw + Math.max(0, 0.04 - Math.abs(ratingHomeShare - ratingAwayShare) * 0.12);
  const marketAway = odds?.away ?? ratingAwayShare * (1 - profile.draw);

  const marketTotal = marketHome + marketDraw + marketAway;

  const baseHome = marketHome / marketTotal;
  const baseDraw = marketDraw / marketTotal;
  const baseAway = marketAway / marketTotal;

  const strengthEdge = baseHome - baseAway;

  const seed = hashNumber(`${homeName}|${awayName}|${leagueName}`);
  const tempoAdj = ((seed % 31) - 15) / 100;
  const homeAdj = (((seed >> 4) % 25) - 12) / 100;
  const awayAdj = (((seed >> 8) % 25) - 12) / 100;

  let totalGoals = profile.goals + tempoAdj;

  if (Math.abs(strengthEdge) > 0.22) totalGoals += 0.12;
  if (Math.abs(strengthEdge) < 0.08) totalGoals -= 0.08;

  const homeGoalShare = clamp(
    50 + strengthEdge * 46 + homeAdj * 20,
    36,
    68
  ) / 100;

  let homeXg = totalGoals * homeGoalShare;
  let awayXg = totalGoals * (1 - homeGoalShare);

  homeXg += Number(match?.stats?.homeXgProxy || 0) * 0.03;
  awayXg += Number(match?.stats?.awayXgProxy || 0) * 0.03;

  homeXg = Math.min(3.6, Math.max(0.35, homeXg));
  awayXg = Math.min(3.4, Math.max(0.25, awayXg + awayAdj));

  let model = scoreMatrix(homeXg, awayXg);

  const marketWeight = odds ? 0.72 : 0.22;

  model.homeWin = model.homeWin * (1 - marketWeight) + baseHome * marketWeight;
  model.draw = model.draw * (1 - marketWeight) + baseDraw * marketWeight;
  model.awayWin = model.awayWin * (1 - marketWeight) + baseAway * marketWeight;

  const total1x2 = model.homeWin + model.draw + model.awayWin;

  const homeWin = model.homeWin / total1x2;
  const draw = model.draw / total1x2;
  const awayWin = model.awayWin / total1x2;

  const bttsCorrection =
    1 - Math.min(0.12, Math.abs(homeXg - awayXg) * 0.055);

  const btts = clamp(Math.round(model.btts * bttsCorrection * 100));
  const over15 = roundPct(model.over15);
  const over25 = roundPct(model.over25);
  const under25 = clamp(100 - over25);
  const under35 = roundPct(model.under35);

  return {
    homeWin: roundPct(homeWin),
    draw: roundPct(draw),
    awayWin: roundPct(awayWin),
    btts,
    over15,
    over25,
    under25,
    under35,
  };
}
