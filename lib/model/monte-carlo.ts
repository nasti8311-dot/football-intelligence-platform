import type { ScoreProbability } from "@/lib/types/football";
import type { ValuePick } from "@/lib/analytics/match-intelligence";

export type SimulatedScore = {
  homeGoals: number;
  awayGoals: number;
};

export type SimulationBucket = {
  label: string;
  probability: number;
  description: string;
};

export type RiskProfile = {
  confidence: number;
  volatility: number;
  entropy: number;
  upsetRisk: number;
  drawRisk: number;
  recommendedStance: "Strong model lean" | "Moderate model lean" | "High variance / avoid" | "Balanced market";
  explanation: string;
};

export type MonteCarloResult = {
  iterations: number;
  seed: string;
  simulatedOutcomes: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  averageGoals: {
    home: number;
    away: number;
    total: number;
  };
  goalSpread: number;
  exactScores: ScoreProbability[];
  buckets: SimulationBucket[];
  riskProfile: RiskProfile;
  confidenceBands: {
    homeWin: [number, number];
    draw: [number, number];
    awayWin: [number, number];
  };
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0) + 1;
}

function halton(index: number, base: number): number {
  let result = 0;
  let fraction = 1 / base;
  let i = index;
  while (i > 0) {
    result += fraction * (i % base);
    i = Math.floor(i / base);
    fraction /= base;
  }
  return result;
}

function poissonCdfInverse(lambda: number, u: number, maxGoals = 14): number {
  const target = Math.min(Math.max(u, 0.0000001), 0.9999999);
  let probability = Math.exp(-lambda);
  let cumulative = probability;
  if (target <= cumulative) return 0;

  for (let goals = 1; goals <= maxGoals; goals += 1) {
    probability *= lambda / goals;
    cumulative += probability;
    if (target <= cumulative) return goals;
  }
  return maxGoals;
}

function wilsonBand(p: number, n: number): [number, number] {
  const z = 1.96;
  const denominator = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denominator;
  const margin = (z / denominator) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

function normalizedEntropy(values: number[]): number {
  const k = values.length;
  const entropy = values.reduce((sum, value) => (value > 0 ? sum - value * Math.log(value) : sum), 0);
  return entropy / Math.log(k);
}

export function runMonteCarloSimulation(input: {
  expectedHomeGoals: number;
  expectedAwayGoals: number;
  seed: string;
  iterations?: number;
}): MonteCarloResult {
  const iterations = input.iterations ?? 20000;
  const offset = hashSeed(input.seed) % 9973;
  const scoreCounts = new Map<string, number>();
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let homeGoalsTotal = 0;
  let awayGoalsTotal = 0;
  let over25 = 0;
  let over35 = 0;
  let btts = 0;
  let oneGoalGame = 0;
  let homeByTwoPlus = 0;
  let awayByTwoPlus = 0;

  for (let i = 1; i <= iterations; i += 1) {
    const uHome = halton(i + offset, 2);
    const uAway = halton(i + offset, 3);
    const homeGoals = poissonCdfInverse(input.expectedHomeGoals, uHome);
    const awayGoals = poissonCdfInverse(input.expectedAwayGoals, uAway);
    const total = homeGoals + awayGoals;
    const diff = homeGoals - awayGoals;

    homeGoalsTotal += homeGoals;
    awayGoalsTotal += awayGoals;
    if (homeGoals > awayGoals) homeWins += 1;
    else if (homeGoals === awayGoals) draws += 1;
    else awayWins += 1;
    if (total > 2.5) over25 += 1;
    if (total > 3.5) over35 += 1;
    if (homeGoals > 0 && awayGoals > 0) btts += 1;
    if (Math.abs(diff) <= 1) oneGoalGame += 1;
    if (diff >= 2) homeByTwoPlus += 1;
    if (diff <= -2) awayByTwoPlus += 1;

    const key = `${homeGoals}-${awayGoals}`;
    scoreCounts.set(key, (scoreCounts.get(key) ?? 0) + 1);
  }

  const homeWin = homeWins / iterations;
  const draw = draws / iterations;
  const awayWin = awayWins / iterations;
  const exactScores = [...scoreCounts.entries()]
    .map(([score, count]) => {
      const [homeGoals, awayGoals] = score.split("-").map(Number);
      return { homeGoals, awayGoals, probability: count / iterations };
    })
    .sort((a, b) => b.probability - a.probability);

  const outcomeValues = [homeWin, draw, awayWin];
  const maxOutcome = Math.max(...outcomeValues);
  const secondOutcome = [...outcomeValues].sort((a, b) => b - a)[1];
  const entropy = normalizedEntropy(outcomeValues);
  const volatility = Math.min(1, entropy * 0.72 + (oneGoalGame / iterations) * 0.28);
  const confidence = Math.max(0, Math.min(1, (maxOutcome - secondOutcome) * 1.7 + (1 - volatility) * 0.45));
  const favoriteIndex = outcomeValues.indexOf(maxOutcome);
  const upsetRisk = favoriteIndex === 0 ? awayWin + draw * 0.45 : favoriteIndex === 2 ? homeWin + draw * 0.45 : Math.max(homeWin, awayWin);
  let recommendedStance: RiskProfile["recommendedStance"] = "Balanced market";
  if (confidence > 0.58 && volatility < 0.58) recommendedStance = "Strong model lean";
  else if (confidence > 0.36 && volatility < 0.68) recommendedStance = "Moderate model lean";
  else if (volatility > 0.7 || maxOutcome < 0.42) recommendedStance = "High variance / avoid";

  return {
    iterations,
    seed: input.seed,
    simulatedOutcomes: { homeWin, draw, awayWin },
    averageGoals: {
      home: homeGoalsTotal / iterations,
      away: awayGoalsTotal / iterations,
      total: (homeGoalsTotal + awayGoalsTotal) / iterations,
    },
    goalSpread: (homeGoalsTotal - awayGoalsTotal) / iterations,
    exactScores,
    buckets: [
      { label: "Over 2.5 Goals", probability: over25 / iterations, description: "Simulationen mit mindestens drei Toren." },
      { label: "Over 3.5 Goals", probability: over35 / iterations, description: "Offenes Spiel mit mindestens vier Toren." },
      { label: "Both Teams Score", probability: btts / iterations, description: "Beide Teams treffen mindestens einmal." },
      { label: "One-goal margin / Draw", probability: oneGoalGame / iterations, description: "Knappe Spielverläufe mit maximal einem Tor Differenz." },
      { label: "Home by 2+", probability: homeByTwoPlus / iterations, description: "Heimteam gewinnt klar mit mindestens zwei Toren." },
      { label: "Away by 2+", probability: awayByTwoPlus / iterations, description: "Auswärtsteam gewinnt klar mit mindestens zwei Toren." },
    ].sort((a, b) => b.probability - a.probability),
    riskProfile: {
      confidence,
      volatility,
      entropy,
      upsetRisk,
      drawRisk: draw,
      recommendedStance,
      explanation: "Confidence kombiniert Outcome-Abstand, Entropie und Anteil knapper Spiele. Hohe Volatilität bedeutet: Modell sieht viele plausible Spielverläufe.",
    },
    confidenceBands: {
      homeWin: wilsonBand(homeWin, iterations),
      draw: wilsonBand(draw, iterations),
      awayWin: wilsonBand(awayWin, iterations),
    },
  };
}

export function enrichValuePicksWithSimulation(valuePicks: ValuePick[], simulation: MonteCarloResult) {
  const simulated = {
    Home: simulation.simulatedOutcomes.homeWin,
    Draw: simulation.simulatedOutcomes.draw,
    Away: simulation.simulatedOutcomes.awayWin,
  } as const;

  return valuePicks.map((pick) => {
    const simulatedProbability = simulated[pick.market];
    const stability = 1 - Math.abs(simulatedProbability - pick.modelProbability);
    const riskAdjustedEdge = pick.edge * Math.max(0.15, stability) * (1 - simulation.riskProfile.volatility * 0.45);
    return { ...pick, simulatedProbability, stability, riskAdjustedEdge };
  }).sort((a, b) => b.riskAdjustedEdge - a.riskAdjustedEdge);
}
