export function liquidityScore(oddsRows: number) {
  if (oddsRows >= 20) return 100;
  if (oddsRows >= 10) return 85;
  if (oddsRows >= 5) return 70;
  if (oddsRows >= 2) return 55;

  return 35;
}
