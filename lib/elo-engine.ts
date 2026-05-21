export type EloTeamRating = {
  teamId: string;
  elo: number;
  attack: number;
  defense: number;
  form: number;
  matches: number;
};

export type EloRatingMap = Map<string, EloTeamRating>;

const BASE_ELO = 1500;
const HOME_ADVANTAGE = 65;
const K_FACTOR = 28;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function actualScore(goalsFor: number, goalsAgainst: number) {
  if (goalsFor > goalsAgainst) return 1;
  if (goalsFor === goalsAgainst) return 0.5;
  return 0;
}

function goalDiffMultiplier(goalDiff: number, eloDiff: number) {
  const diff = Math.max(1, Math.abs(goalDiff));
  return Math.log(diff + 1) * (2.2 / ((eloDiff * 0.001) + 2.2));
}

function defaultRating(teamId: string): EloTeamRating {
  return {
    teamId,
    elo: BASE_ELO,
    attack: 1,
    defense: 1,
    form: 0.5,
    matches: 0,
  };
}

function getOrCreate(map: EloRatingMap, teamId: string) {
  const current = map.get(teamId);

  if (current) return current;

  const created = defaultRating(teamId);
  map.set(teamId, created);
  return created;
}

export function buildEloRatings(matches: any[]): EloRatingMap {
  const ratings: EloRatingMap = new Map();

  const played = matches
    .filter(
      (match) =>
        match.homeTeamId &&
        match.awayTeamId &&
        match.homeGoals !== null &&
        match.homeGoals !== undefined &&
        match.awayGoals !== null &&
        match.awayGoals !== undefined
    )
    .sort((a, b) => {
      const ad = a.kickoff ? new Date(a.kickoff).getTime() : 0;
      const bd = b.kickoff ? new Date(b.kickoff).getTime() : 0;
      return ad - bd;
    });

  for (const match of played) {
    const home = getOrCreate(ratings, match.homeTeamId);
    const away = getOrCreate(ratings, match.awayTeamId);

    const homeGoals = Number(match.homeGoals);
    const awayGoals = Number(match.awayGoals);

    const homeEloWithAdvantage = home.elo + HOME_ADVANTAGE;

    const homeExpected = expectedScore(homeEloWithAdvantage, away.elo);
    const awayExpected = 1 - homeExpected;

    const homeActual = actualScore(homeGoals, awayGoals);
    const awayActual = 1 - homeActual;

    const eloDiff = Math.abs(home.elo - away.elo);
    const gdMultiplier = goalDiffMultiplier(homeGoals - awayGoals, eloDiff);

    const homeDelta = K_FACTOR * gdMultiplier * (homeActual - homeExpected);
    const awayDelta = K_FACTOR * gdMultiplier * (awayActual - awayExpected);

    home.elo = Math.round(home.elo + homeDelta);
    away.elo = Math.round(away.elo + awayDelta);

    home.matches += 1;
    away.matches += 1;

    home.attack = clamp(home.attack * 0.88 + (0.65 + homeGoals * 0.28) * 0.12, 0.45, 2.4);
    away.attack = clamp(away.attack * 0.88 + (0.65 + awayGoals * 0.28) * 0.12, 0.45, 2.4);

    home.defense = clamp(home.defense * 0.88 + (1.65 - awayGoals * 0.22) * 0.12, 0.45, 2.1);
    away.defense = clamp(away.defense * 0.88 + (1.65 - homeGoals * 0.22) * 0.12, 0.45, 2.1);

    home.form = clamp(home.form * 0.82 + homeActual * 0.18, 0, 1);
    away.form = clamp(away.form * 0.82 + awayActual * 0.18, 0, 1);
  }

  return ratings;
}

export function getEloRating(
  ratings: EloRatingMap,
  teamId?: string | null
): EloTeamRating {
  if (!teamId) return defaultRating("unknown");

  return ratings.get(teamId) || defaultRating(teamId);
}

export function eloWinProbability(home: EloTeamRating, away: EloTeamRating) {
  const homeExpected = expectedScore(home.elo + HOME_ADVANTAGE, away.elo);
  const awayExpected = 1 - homeExpected;

  const drawBase =
    0.26 -
    Math.min(0.08, Math.abs(homeExpected - awayExpected) * 0.18);

  const remaining = 1 - drawBase;

  return {
    home: homeExpected * remaining,
    draw: drawBase,
    away: awayExpected * remaining,
  };
}
