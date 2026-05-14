export function eloExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function eloStrengthMultiplier(homeElo: number, awayElo: number, eloWeight = 0.28): { home: number; away: number } {
  const homeScore = eloExpectedScore(homeElo, awayElo);
  const awayScore = 1 - homeScore;
  return {
    home: 1 - eloWeight / 2 + homeScore * eloWeight,
    away: 1 - eloWeight / 2 + awayScore * eloWeight,
  };
}

export function updateElo(rating: number, opponentRating: number, actualScore: number, kFactor = 24): number {
  const expected = eloExpectedScore(rating, opponentRating);
  return Math.round(rating + kFactor * (actualScore - expected));
}
