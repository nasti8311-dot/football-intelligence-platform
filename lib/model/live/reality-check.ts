export function realityCheck({
  probability,
  edge,
  liquidity,
}: {
  probability: number;
  edge: number;
  liquidity: number;
}) {
  if (probability > 85 && liquidity < 40) {
    return false;
  }

  if (edge > 20) {
    return false;
  }

  return true;
}
