export function expectedROI({
  probability,
  impliedProbability,
}: {
  probability: number;
  impliedProbability?: number;
}) {
  if (!impliedProbability || impliedProbability <= 0) {
    return 0;
  }

  const edge = probability - impliedProbability;

  return Number((edge * 0.75).toFixed(2));
}
