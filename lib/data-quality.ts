export function getDataQualityLabel(level?: "LOW" | "MEDIUM" | "HIGH") {
  if (level === "HIGH") return "Hohe Datenqualität";
  if (level === "MEDIUM") return "Mittlere Datenqualität";
  return "Nicht genug Daten";
}

export function getRatingLabel(value?: number) {
  if (!value) return "—";
  if (value >= 1.2) return "Stark";
  if (value >= 1.05) return "Gut";
  if (value >= 0.95) return "Ø";
  return "Schwach";
}
