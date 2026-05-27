export function isNoisyMatch({
  over25,
  btts,
  homeWin,
  awayWin,
}: {
  over25: number;
  btts: number;
  homeWin: number;
  awayWin: number;
}) {
  // zu viele ähnliche Wahrscheinlichkeiten = instabiles Spiel

  const values = [over25, btts, homeWin, awayWin];

  const max = Math.max(...values);
  const min = Math.min(...values);

  return max - min < 8;
}
