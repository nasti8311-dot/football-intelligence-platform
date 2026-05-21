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

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function buildTeamRating(matches: any[], teamId: string): TeamRating {
  const played = matches
    .filter((m) =>
    ["FINISHED", "completed", "final"].includes(
      String(m.status)
    )
  )
    .slice(0, 15);

  if (!played.length) {
    return {
      attack: 1,
      defense: 1,
      form: 0.5,
      homeAdvantage: 1,
      sampleSize: 0,
    };
  }

  const gf: number[] = [];
  const ga: number[] = [];

  const recentPoints: number[] = [];

  const homeGoals: number[] = [];
  const awayGoals: number[] = [];

  for (const m of played) {
    const isHome = m.homeTeamId === teamId;

    const goalsFor = isHome
      ? Number(m.homeGoals || 0)
      : Number(m.awayGoals || 0);

    const goalsAgainst = isHome
      ? Number(m.awayGoals || 0)
      : Number(m.homeGoals || 0);

    gf.push(goalsFor);
    ga.push(goalsAgainst);

    if (isHome) homeGoals.push(goalsFor);
    else awayGoals.push(goalsFor);

    if (goalsFor > goalsAgainst) {
      recentPoints.push(3);
    } else if (goalsFor === goalsAgainst) {
      recentPoints.push(1);
    } else {
      recentPoints.push(0);
    }
  }

  const gfAvg = avg(gf);
  const gaAvg = avg(ga);

  const pointsAvg =
    avg(recentPoints) / 3;

  const homeAvg =
    avg(homeGoals) || gfAvg;

  const awayAvg =
    avg(awayGoals) || gfAvg;

  const attack =
    clamp(
      0.55 + gfAvg * 0.55,
      0.5,
      2.5
    );

  const defense =
    clamp(
      1.9 - gaAvg * 0.45,
      0.45,
      2.2
    );

  const form =
    clamp(pointsAvg, 0, 1);

  const homeAdvantage =
    clamp(
      homeAvg / Math.max(0.6, awayAvg),
      0.75,
      1.45
    );

  return {
    attack,
    defense,
    form,
    homeAdvantage,
    sampleSize: played.length,
  };
}

export function buildTeamRatings(matches: any[]) {
  const byTeam = new Map<string, any[]>();
  const ratings = new Map<string, TeamRating>();

  for (const match of matches) {
    if (!match.homeTeamId || !match.awayTeamId) {
      continue;
    }

    if (!byTeam.has(match.homeTeamId)) {
      byTeam.set(match.homeTeamId, []);
    }

    if (!byTeam.has(match.awayTeamId)) {
      byTeam.set(match.awayTeamId, []);
    }

    byTeam.get(match.homeTeamId)?.push(match);
    byTeam.get(match.awayTeamId)?.push(match);
  }

  for (const [teamId, teamMatches] of byTeam.entries()) {
    ratings.set(
      teamId,
      buildTeamRating(teamMatches, teamId)
    );
  }

  return ratings;
}

export function getTeamRating(
  ratings: Map<string, TeamRating>,
  teamId?: string | null
): TeamRating {
  return (
    ratings.get(teamId || "") || {
      attack: 1,
      defense: 1,
      form: 0.5,
      homeAdvantage: 1,
      sampleSize: 0,
    }
  );
}
