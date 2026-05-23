export function estimateOver15(homeGoals: number, awayGoals: number) {
  const total = homeGoals + awayGoals;

  if (total >= 3.4) return 82;
  if (total >= 3.0) return 76;
  if (total >= 2.7) return 71;
  if (total >= 2.4) return 66;
  if (total >= 2.1) return 61;

  return 54;
}

export function estimateUnder35(homeGoals: number, awayGoals: number) {
  const total = homeGoals + awayGoals;

  if (total <= 1.8) return 84;
  if (total <= 2.1) return 79;
  if (total <= 2.4) return 74;
  if (total <= 2.7) return 68;
  if (total <= 3.0) return 61;

  return 54;
}
