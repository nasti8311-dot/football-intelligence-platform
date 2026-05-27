export function marketStrength({
  probability,
  hitRate,
}: {
  probability: number;
  hitRate: number;
}) {
  return Number(
    (
      probability * 0.7 +
      hitRate * 0.3
    ).toFixed(2)
  );
}
