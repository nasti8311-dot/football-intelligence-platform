export function calibrateProbability(prob: number) {
  // konservativer machen
  if (prob >= 80) return prob - 8;
  if (prob >= 75) return prob - 6;
  if (prob >= 70) return prob - 5;
  if (prob >= 65) return prob - 4;
  if (prob >= 60) return prob - 3;

  return prob;
}
