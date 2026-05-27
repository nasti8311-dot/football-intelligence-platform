export function finalApproval({
  trust,
  ranking,
  edge,
}: {
  trust: number;
  ranking: number;
  edge: number;
}) {
  if (trust < 65) return false;

  if (ranking < 68) return false;

  if (edge < 3) return false;

  return true;
}
