export function reverseLineMovement({
  publicSide,
  oddsMovement,
}: {
  publicSide?: "home" | "away" | "over" | "under";
  oddsMovement: number;
}) {
  if (!publicSide) return false;

  return oddsMovement > 5;
}
