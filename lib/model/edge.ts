export function calculateEdge(modelProb: number, impliedProb?: number) {
  if (!impliedProb || impliedProb <= 0) return 0;

  return Number((modelProb - impliedProb).toFixed(2));
}

export function isPositiveEV(modelProb: number, impliedProb?: number) {
  return calculateEdge(modelProb, impliedProb) >= 4;
}
