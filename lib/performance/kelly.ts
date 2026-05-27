export function fractionalKelly({
  probability,
  odds,
}: {
  probability: number;
  odds?: number;
}) {
  if (!odds || odds <= 1) return 0;

  const p = probability / 100;
  const q = 1 - p;
  const b = odds - 1;

  const kelly = ((b * p) - q) / b;

  return Number(Math.max(0, kelly * 0.25).toFixed(4));
}
