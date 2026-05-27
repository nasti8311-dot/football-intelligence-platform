export function finalConfidence({
  probability,
  edge,
  stability,
  oddsRows,
}: {
  probability: number;
  edge: number;
  stability: number;
  oddsRows: number;
}) {
  let score = probability;

  score += edge * 0.8;
  score += stability * 0.3;

  if (oddsRows > 0) {
    score += 3;
  }

  if (score >= 90) return "ELITE";
  if (score >= 82) return "A+";
  if (score >= 74) return "A";
  if (score >= 66) return "B";

  return "C";
}
