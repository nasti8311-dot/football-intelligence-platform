export function bookmakerConfidence({
  modelProb,
  impliedProb,
}: {
  modelProb: number;
  impliedProb?: number;
}) {
  if (!impliedProb) return 0;

  const diff = Math.abs(modelProb - impliedProb);

  // kleiner Unterschied = Markt bestätigt Modell
  return Math.max(0, 100 - diff * 4);
}
