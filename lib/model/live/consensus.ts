export function consensusScore({
  probability,
  bookmakerConfidence,
  liquidity,
}: {
  probability: number;
  bookmakerConfidence: number;
  liquidity: number;
}) {
  return Number(
    (
      probability * 0.5 +
      bookmakerConfidence * 0.3 +
      liquidity * 0.2
    ).toFixed(2)
  );
}
