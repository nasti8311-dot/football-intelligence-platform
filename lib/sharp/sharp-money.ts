export function sharpMoneySignal({
  movement,
  probability,
}: {
  movement: number;
  probability: number;
}) {
  let score = 0;

  if (movement > 8) score += 12;
  else if (movement > 5) score += 8;
  else if (movement > 2) score += 4;

  if (probability > 70) score += 5;

  return score;
}
