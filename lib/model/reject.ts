export function shouldRejectPrediction({
  variance,
  probability,
  edge,
}: {
  variance: number;
  probability: number;
  edge: number;
}) {
  if (variance < 20) return true;

  if (probability < 58) return true;

  if (edge < 3) return true;

  return false;
}
