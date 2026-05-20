export type TeamRating = {
  attack: number;
  defense: number;
  form: number;
  homeAdvantage: number;
  sampleSize: number;
};

const DEFAULT_RATING: TeamRating = {
  attack: 1,
  defense: 1,
  form: 0,
  homeAdvantage: 1.08,
  sampleSize: 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function buildTeamRatings(matches: any[]) {
  const table = new Map<string, any>();

  for (const match of matches) {
    if (
      !match.homeTeamId ||
      !match.awayTeamId ||
      match.homeGoals == null ||
      match.awayGoals == null
    ) {
      continue;
    }

    if (!table.has(match.homeTeamId)) {
      table.set(match.homeTeamId, {
        goalsFor: 0,
        goalsAgainst: 0,
        matches: 0,
        points: 0,
        homeMatches: 0,
        homeGoalsFor: 0,
      });
    }

    if (!table.has(match.awayTeamId)) {
      table.set(match.awayTeamId, {
        goalsFor: 0,
        goalsAgainst: 0,
        matches: 0,
        points: 0,
        homeMatches: 0,
        homeGoalsFor: 0,
      });
    }

    const home = table.get(match.homeTeamId);
    const away = table.get(match.awayTeamId);

    home.goalsFor += match.homeGoals;
    home.goalsAgainst += match.awayGoals;
    home.matches += 1;
    home.homeMatches += 1;
    home.homeGoalsFor += match.homeGoals;

    away.goalsFor += match.awayGoals;
    away.goalsAgainst += match.homeGoals;
    away.matches += 1;

    if (match.homeGoals > match.awayGoals) {
      home.points += 3;
    } else if (match.homeGoals < match.awayGoals) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  const leagueAvgGoalsFor =
    Array.from(table.values()).reduce((sum, t) => sum + t.goalsFor, 0) /
      Math.max(1, Array.from(table.values()).reduce((sum, t) => sum + t.matches, 0)) ||
    1.35;

  const ratings = new Map<string, TeamRating>();

  for (const [teamId, t] of table.entries()) {
    const gfPerGame = t.goalsFor / Math.max(1, t.matches);
    const gaPerGame = t.goalsAgainst / Math.max(1, t.matches);
    const pointsPerGame = t.points / Math.max(1, t.matches);
    const homeGfPerGame = t.homeGoalsFor / Math.max(1, t.homeMatches);

    ratings.set(teamId, {
      attack: clamp(gfPerGame / leagueAvgGoalsFor, 0.55, 1.75),
      defense: clamp(leagueAvgGoalsFor / Math.max(0.45, gaPerGame), 0.55, 1.75),
      form: clamp((pointsPerGame - 1.35) / 1.65, -0.35, 0.45),
      homeAdvantage: clamp(homeGfPerGame / Math.max(0.8, gfPerGame), 0.95, 1.22),
      sampleSize: t.matches,
    });
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
