export function stabilityScore({
  homeWin,
  draw,
  awayWin,
}: {
  homeWin: number;
  draw: number;
  awayWin: number;
}) {
  const arr = [homeWin, draw, awayWin].sort((a, b) => b - a);

  return Number((arr[0] - arr[1]).toFixed(2));
}
