import type { FootballProbabilities } from "@/lib/probability-engine";

export type ValueSignal = {
  market: string;
  modelProbability: number;
  marketProbability: number | null;
  edge: number | null;
  value: "NONE" | "SMALL" | "GOOD" | "STRONG";
};

function impliedFromPrice(price: number) {
  return price > 1 ? 1 / price : null;
}

function getMarketProb(match: any, market: string, outcome: string) {
  const rows = Array.isArray(match?.bookmakerOdds) ? match.bookmakerOdds : [];

  const values = rows
    .filter((row: any) => {
      return (
        String(row.market || "").toLowerCase() === market.toLowerCase() &&
        String(row.outcome || "").toLowerCase() === outcome.toLowerCase()
      );
    })
    .map((row: any) => Number(row.impliedProb || impliedFromPrice(Number(row.price))))
    .filter((v: number) => v > 0 && v < 1);

  if (!values.length) return null;

  return values.reduce((a: number, b: number) => a + b, 0) / values.length;
}

function classify(edge: number | null): ValueSignal["value"] {
  if (edge == null) return "NONE";
  if (edge >= 0.1) return "STRONG";
  if (edge >= 0.06) return "GOOD";
  if (edge >= 0.03) return "SMALL";
  return "NONE";
}

export function calculateValueSignals(match: any, probs: FootballProbabilities): ValueSignal[] {
  const homeName = match?.homeTeam?.name || "";
  const awayName = match?.awayTeam?.name || "";

  const signals: ValueSignal[] = [
    {
      market: "Heimsieg",
      modelProbability: probs.homeWin / 100,
      marketProbability: getMarketProb(match, "h2h", homeName),
      edge: null,
      value: "NONE",
    },
    {
      market: "Remis",
      modelProbability: probs.draw / 100,
      marketProbability: getMarketProb(match, "h2h", "Draw"),
      edge: null,
      value: "NONE",
    },
    {
      market: "Auswärtssieg",
      modelProbability: probs.awayWin / 100,
      marketProbability: getMarketProb(match, "h2h", awayName),
      edge: null,
      value: "NONE",
    },
    {
      market: "Über 2,5",
      modelProbability: probs.over25 / 100,
      marketProbability: getMarketProb(match, "totals", "Over 2.5"),
      edge: null,
      value: "NONE",
    },
    {
      market: "Unter 2,5",
      modelProbability: probs.under25 / 100,
      marketProbability: getMarketProb(match, "totals", "Under 2.5"),
      edge: null,
      value: "NONE",
    },
  ];

  return signals
    .map((signal) => {
      const edge =
        signal.marketProbability == null
          ? null
          : signal.modelProbability - signal.marketProbability;

      return {
        ...signal,
        edge,
        value: classify(edge),
      };
    })
    .sort((a, b) => (b.edge || -1) - (a.edge || -1));
}

export function getBestValueSignal(signals: ValueSignal[]) {
  return signals.find((signal) => signal.value !== "NONE") || null;
}
