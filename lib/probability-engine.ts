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

function teamStrength(name?: string | null) {
  const h = hashNumber(name || "team");
  return 0.75 + (h % 70) / 100;
}

function leagueGoalFactor(name?: string | null) {
  const n = (name || "").toLowerCase();

  if (n.includes("eredivisie")) return 1.18;
  if (n.includes("bundesliga")) return 1.12;
  if (n.includes("champions")) return 1.08;
  if (n.includes("mls")) return 1.1;
  if (n.includes("belg")) return 1.08;
  if (n.includes("serie")) return 0.94;
  if (n.includes("ligue")) return 0.96;
  if (n.includes("greece") || n.includes("griechen")) return 0.9;

  return 1;
}

function normalizeOdds(odds?: OddsLike[]) {
  const valid = odds?.filter((o) => o.homeOdds && o.drawOdds && o.awayOdds) || [];

  if (valid.length === 0) return null;

  const avg = valid.reduce(
    (acc, o) => ({
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

export function calculateFootballProbabilities(match: any): FootballProbabilities {
  const oddsProb = normalizeOdds(match?.odds);

  const homeName = match?.homeTeam?.name || "home";
  const awayName = match?.awayTeam?.name || "away";
  const leagueName = match?.league?.name || "league";

  const homeStrength = teamStrength(homeName);
  const awayStrength = teamStrength(awayName);
  const leagueFactor = leagueGoalFactor(leagueName);

  const rawHome =
    oddsProb?.home ??
    (homeStrength * 1.12) / (homeStrength * 1.12 + awayStrength + 0.72);

  const rawDraw =
    oddsProb?.draw ??
    0.22 + Math.max(0, 0.12 - Math.abs(homeStrength - awayStrength) * 0.06);

  const rawAway =
    oddsProb?.away ??
    awayStrength / (homeStrength * 1.12 + awayStrength + 0.72);

  const totalRaw = rawHome + rawDraw + rawAway;

  const baseHome = rawHome / totalRaw;
  const baseDraw = rawDraw / totalRaw;
  const baseAway = rawAway / totalRaw;

  const strengthDiff = baseHome - baseAway;
  const matchHash = hashNumber(`${homeName}-${awayName}-${leagueName}`);

  const tempoNoise = ((matchHash % 21) - 10) / 100;
  const homeNoise = (((matchHash >> 3) % 17) - 8) / 100;
  const awayNoise = (((matchHash >> 6) % 17) - 8) / 100;

  let homeXg =
    (1.38 +
      strengthDiff * 1.2 +
      homeNoise +
      (match?.stats?.homeXgProxy ?? 0) * 0.05) *
    leagueFactor;

  let awayXg =
    (1.08 -
      strengthDiff * 0.95 +
      awayNoise +
      (match?.stats?.awayXgProxy ?? 0) * 0.05) *
    leagueFactor;

  homeXg = Math.min(3.4, Math.max(0.35, homeXg));
  awayXg = Math.min(3.2, Math.max(0.25, awayXg));

  homeXg += tempoNoise;
  awayXg += tempoNoise * 0.75;

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

  const oddsWeight = oddsProb ? 0.65 : 0.15;

  homeWin = homeWin * (1 - oddsWeight) + baseHome * oddsWeight;
  draw = draw * (1 - oddsWeight) + baseDraw * oddsWeight;
  awayWin = awayWin * (1 - oddsWeight) + baseAway * oddsWeight;

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
