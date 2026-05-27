export function steamMove({
  movement,
  minutes,
}: {
  movement: number;
  minutes: number;
}) {
  if (minutes <= 15 && movement >= 6) {
    return true;
  }

  return false;
}
