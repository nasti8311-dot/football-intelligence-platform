export function confidenceFromProbability(prob: number) {
  if (prob >= 78) return "ELITE";
  if (prob >= 70) return "A+";
  if (prob >= 64) return "A";
  if (prob >= 58) return "B";
  return "C";
}
