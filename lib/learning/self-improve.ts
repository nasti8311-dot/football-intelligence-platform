export function selfImproveProbability({
  probability,
  marketHitRate,
}: {
  probability: number;
  marketHitRate: number;
}) {
  const adjustment = (marketHitRate - 50) * 0.08;

  return Number(
    Math.max(
      1,
      Math.min(99, probability + adjustment)
    ).toFixed(2)
  );
}
