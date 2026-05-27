export function finalSharpScore({
  probability,
  sharpMoney,
  liquidity,
  edge,
}: {
  probability: number;
  sharpMoney: number;
  liquidity: number;
  edge: number;
}) {
  return Number(
    (
      probability * 0.4 +
      sharpMoney * 0.2 +
      liquidity * 0.2 +
      edge * 0.2
    ).toFixed(2)
  );
}
