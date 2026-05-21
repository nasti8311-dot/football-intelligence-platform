export type TeamRating = {
  attack: number;
  defense: number;
  form: number;
  homeAdvantage: number;
  sampleSize: number;
};

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function buildTeamRating(matches: any[], teamId: string): TeamRating {
  const played = matches
    .filter((m) => m.status === "FINISHED")
    .slice(0, 12);

  if (!played.length) {
    return {
      attack: 1,
      defense: 1,
      form: 0,
      homeAdvantage: 1,
      sampleSize: 0,
    };
  }

  const goalsFor: number[] = [];
  const goalsAgainst: number[] = [];

  const homeGoals: number[] = [];
  const awayGoals: number[] = [];

  let points = 0;

  for (const m of played) {
    const isHome = m.homeTeamId === teamId;

    const gf = isHome ? m.homeGoals : m.awayGoals;
    const ga = isHome ? m.awayGoals : m.homeGoals;

    goalsFor.push(gf);
    goalsAgainst.push(ga);

    if (isHome) {
      homeGoals.push(gf);
    } else {
      awayGoals.push(gf);
    }

    if (gf > ga) points += 3;
    else if (gf === ga) points += 1;
  }

  const gfAvg = avg(goalsFor);
  const gaAvg = avg(goalsAgainst);

  const homeAvg = avg(homeGoals) || gfAvg;
  const awayAvg = avg(awayGoals) || gfAvg;

  const attack =
    0.7 +
    gfAvg * 0.28;

  const defense =
    1.6 -
    gaAvg * 0.22;

  const form =
    points / (played.length * 3);

  const homeAdvantage =
    homeAvg / Math.max(0.8, awayAvg);

  return {
    attack: Math.max(0.6, Math.min(2.2, attack)),
    defense: Math.max(0.6, Math.min(1.8, defense)),
    form: Math.max(0, Math.min(1, form)),
    homeAdvantage: Math.max(0.8, Math.min(1.4, homeAdvantage)),
    sampleSize: played.length,
  };
}
