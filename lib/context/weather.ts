export function weatherImpact({
  rain,
  wind,
}: {
  rain?: boolean;
  wind?: boolean;
}) {
  let impact = 0;

  if (rain) impact += 4;
  if (wind) impact += 3;

  return impact;
}
