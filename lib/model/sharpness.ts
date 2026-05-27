export function sharpnessScore({
  probability,
  edge,
  stability,
}: {
  probability: number;
  edge: number;
  stability: number;
}) {
  return Number(
    (
      probability * 0.5 +
      edge * 0.3 +
      stability * 0.2
    ).toFixed(2)
  );
}
