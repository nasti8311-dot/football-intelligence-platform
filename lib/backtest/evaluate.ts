export function evaluatePrediction({
  probability,
  result,
}: {
  probability: number;
  result: boolean;
}) {
  return {
    predicted: probability,
    hit: result,
    error: Number(Math.abs((result ? 100 : 0) - probability).toFixed(2)),
  };
}
