export function calculateValueScore(probability: number, implied?: number) {
  const prob = Number(probability || 0);

  // Ohne echte Odds konservativ bleiben
  if (!implied) {
    return Math.round(prob * 1.15);
  }

  const edge = prob - implied;

  return Math.round(
    Math.max(
      0,
      prob + edge * 1.8
    )
  );
}
