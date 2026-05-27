export function isTrapLine({
  probability,
  impliedProb,
}: {
  probability: number;
  impliedProb?: number;
}) {
  if (!impliedProb) return false;

  const edge = probability - impliedProb;

  // unrealistische edges vermeiden
  return edge > 18;
}
