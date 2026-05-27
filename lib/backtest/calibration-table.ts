export function calibrationBucket(prob: number) {
  if (prob >= 80) return "80+";
  if (prob >= 70) return "70-79";
  if (prob >= 60) return "60-69";
  return "<60";
}
