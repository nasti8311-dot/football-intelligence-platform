export function reliabilityFromSample(matches: number) {
  if (matches >= 30) return 100;
  if (matches >= 20) return 85;
  if (matches >= 10) return 70;
  if (matches >= 5) return 55;

  return 35;
}
