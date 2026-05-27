export function calculateCLV(modelProb: number, impliedProb?: number) {
  if (!impliedProb) return 0;
  return Number((modelProb - impliedProb).toFixed(2));
}
