export function finalPredictionRating({
  probability,
  roi,
  trust,
  sharpness,
}: {
  probability: number;
  roi: number;
  trust: number;
  sharpness: number;
}) {
  return Number(
    (
      probability * 0.4 +
      roi * 0.2 +
      trust * 0.2 +
      sharpness * 0.2
    ).toFixed(2)
  );
}
