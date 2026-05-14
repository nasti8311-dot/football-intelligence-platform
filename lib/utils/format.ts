export function percent(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

export function decimal(value: number, digits = 2): string {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}
