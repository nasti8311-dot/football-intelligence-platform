export function riskPenalty({
  over25,
  btts,
}: {
  over25: number;
  btts: number;
}) {
  let penalty = 0;

  if (over25 > 78) penalty += 6;
  if (btts > 75) penalty += 5;

  return penalty;
}
