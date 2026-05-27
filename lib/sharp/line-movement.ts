export function lineMovement({
  openOdds,
  currentOdds,
}: {
  openOdds?: number;
  currentOdds?: number;
}) {
  if (!openOdds || !currentOdds) return 0;

  return Number(
    (((openOdds - currentOdds) / openOdds) * 100).toFixed(2)
  );
}
