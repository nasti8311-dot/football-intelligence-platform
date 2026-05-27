export function shouldBlacklistMarket({
  hitRate,
  sampleSize,
}: {
  hitRate: number;
  sampleSize: number;
}) {
  if (sampleSize < 20) return false;

  return hitRate < 42;
}
