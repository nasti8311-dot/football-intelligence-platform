export function fraudCheck({
  probability,
  impliedProb,
  edge,
}: {
  probability: number;
  impliedProb?: number;
  edge: number;
}) {
  if (!impliedProb) return true;

  // unrealistische Modellabweichungen rauswerfen
  if (edge > 22) return false;

  // 95% soccer picks praktisch nie realistisch
  if (probability > 92) return false;

  return true;
}
