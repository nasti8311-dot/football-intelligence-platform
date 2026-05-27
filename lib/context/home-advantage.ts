export function dynamicHomeAdvantage({
  league,
  crowdFactor = 1,
}: {
  league?: string;
  crowdFactor?: number;
}) {
  let base = 6;

  const l = String(league || "").toLowerCase();

  if (l.includes("turkey")) base += 3;
  if (l.includes("greece")) base += 2;
  if (l.includes("champions")) base -= 2;

  return Number((base * crowdFactor).toFixed(2));
}
