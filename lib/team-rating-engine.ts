export type TeamRating = {
  attack: number;
  defense: number;
  form: number;
  homeAdvantage: number;
  sampleSize: number;
};

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const DEFAULT_RATING: TeamRating = {
  attack: 1,
  defense: 1,
  form: 0.5,
  homeAdvantage: 1,
  sampleSize: 0,
};

export function buildTeamRating(matches: any[], teamId: string): TeamRating {
  const played = matches
    .filter(
      (m) =>
        m.homeGoals !== null &&
        m.homeGoals !== undefined &&
        m.awayGoals !== null &&
        m.awayGoals !== undefined
    )
    .sort((a, b) => {
      const ad = a.kickoff ? new Date(a.kickoff).getTime() : 0;
      const bd = b.kickoff ? new Date(b.kickoff).getTime() : 0;
      return bd - ad;
    })
    .slice(0, 15);

  if (!played.length) return DEFAULT_RATING;

  const goalsFor: number[] = [];
  const goalsAgainst: number[] = [];
  const points: number[] = [];
  const homeFor: number[] = [];
  const awayFor: number[] = [];

  for (const match of played) {
    const isHome = match.homeTeamId === teamId;

    const gf = Number(isHome ? match.homeGoals : match.awayGoals);
    const ga = Number(isHome ? match.awayGoals : match.homeGoals);

    goalsFor.push(gf);
    goalsAgainst.push(ga);

    if (isHome) homeFor.push(gf);
    else awayFor.push(gf);

    if (gf > ga) points.push(3);
    else if (gf === ga) points.push(1);
    else points.push(0);
  }

  const gfAvg = avg(goalsFor);
  const gaAvg = avg(goalsAgainst);
  const ppg = avg(points);
  const homeAvg = avg(homeFor) || gfAvg;
  const awayAvg = avg(awayFor) || gfAvg;

  return {
    attack: clamp(0.45 + gfAvg * 0.65, 0.45, 2.4),
    defense: clamp(1.95 - gaAvg * 0.5, 0.45, 2.1),
    form: clamp(ppg / 3, 0, 1),
    homeAdvantage: clamp(homeAvg / Math.max(0.6, awayAvg), 0.75, 1.45),
    sampleSize: played.length,
  };
}

export function buildTeamRatings(matches: any[]) {
  const byTeam = new Map<string, any[]>();
  const ratings = new Map<string, TeamRating>();

  for (const match of matches) {
    if (!match.homeTeamId || !match.awayTeamId) continue;

    if (!byTeam.has(match.homeTeamId)) byTeam.set(match.homeTeamId, []);
    if (!byTeam.has(match.awayTeamId)) byTeam.set(match.awayTeamId, []);

    byTeam.get(match.homeTeamId)?.push(match);
    byTeam.get(match.awayTeamId)?.push(match);
  }

  for (const [teamId, teamMatches] of byTeam.entries()) {
    ratings.set(teamId, buildTeamRating(teamMatches, teamId));
  }

  return ratings;
}

export function getTeamRating(
  ratings: Map<string, TeamRating>,
  teamId?: string | null
): TeamRating {
  if (!teamId) return DEFAULT_RATING;
  return ratings.get(teamId) || DEFAULT_RATING;
}
