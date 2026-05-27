export function fatiguePenalty(daysRest: number) {
  if (daysRest >= 7) return 0;

  if (daysRest <= 2) return 12;

  if (daysRest <= 4) return 7;

  return 3;
}
