export function drawdownProtection({
  probability,
  variance,
}: {
  probability: number;
  variance: number;
}) {
  let protection = 0;

  if (variance > 120) protection += 8;
  if (probability < 62) protection += 5;

  return protection;
}
