export function marketEfficiency({
  modelProb,
  impliedProb,
}: {
  modelProb: number;
  impliedProb?: number;
}) {
  if (!impliedProb) return 0;

  const diff = modelProb - impliedProb;

  // konservative Effizienz
  return Number((diff * 0.85).toFixed(2));
}
