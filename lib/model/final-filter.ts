export function passesFinalPredictionFilter({
  probability,
  edge,
  qualityScore,
  oddsRows,
}: {
  probability: number;
  edge: number;
  qualityScore: number;
  oddsRows?: number;
}) {
  // harte Qualitätsregeln

  if (probability < 60) return false;

  if (qualityScore < 78) return false;

  // wenn echte odds vorhanden sind -> edge nötig
  if ((oddsRows || 0) > 0 && edge < 4) {
    return false;
  }

  return true;
}
