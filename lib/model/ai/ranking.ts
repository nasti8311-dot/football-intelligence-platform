export function rankingScore({
  probability,
  edge,
  trust,
  sharpness,
}: {
  probability: number;
  edge: number;
  trust: number;
  sharpness: number;
}) {
  return Number(
    (
      probability * 0.4 +
      edge * 0.2 +
      trust * 0.2 +
      sharpness * 0.2
    ).toFixed(2)
  );
}
