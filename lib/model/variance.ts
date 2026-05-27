export function varianceRisk({
  homeWin,
  draw,
  awayWin,
}: {
  homeWin: number;
  draw: number;
  awayWin: number;
}) {
  const arr = [homeWin, draw, awayWin];

  const avg =
    arr.reduce((a, b) => a + b, 0) / arr.length;

  const variance =
    arr.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
    arr.length;

  return Number(variance.toFixed(2));
}
