export function metaScore({
  probability,
  edge,
  liquidity,
  stability,
  quality,
}: {
  probability: number;
  edge: number;
  liquidity: number;
  stability: number;
  quality: number;
}) {
  return Number(
    (
      probability * 0.35 +
      edge * 0.20 +
      liquidity * 0.15 +
      stability * 0.15 +
      quality * 0.15
    ).toFixed(2)
  );
}
