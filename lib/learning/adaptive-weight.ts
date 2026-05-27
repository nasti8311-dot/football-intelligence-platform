export function adaptiveWeight(hitRate: number) {
  if (hitRate >= 70) return 1.15;
  if (hitRate >= 60) return 1.05;
  if (hitRate >= 50) return 1.0;
  if (hitRate >= 45) return 0.92;

  return 0.82;
}
