export function scheduleCongestion(matchesLast14Days: number) {
  if (matchesLast14Days >= 6) return 10;
  if (matchesLast14Days >= 5) return 7;
  if (matchesLast14Days >= 4) return 4;

  return 0;
}
