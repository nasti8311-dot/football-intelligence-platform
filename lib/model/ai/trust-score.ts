export function trustScore({
  quality,
  liquidity,
  bookmakerConfidence,
}: {
  quality: number;
  liquidity: number;
  bookmakerConfidence: number;
}) {
  return Number(
    (
      quality * 0.5 +
      liquidity * 0.25 +
      bookmakerConfidence * 0.25
    ).toFixed(2)
  );
}
