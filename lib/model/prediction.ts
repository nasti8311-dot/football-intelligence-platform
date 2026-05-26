import { getTeamById } from "@/data/teams";
import type { MatchInput, MatchPrediction, ScoreProbability } from "@/lib/types/football";
import { resolveModelConfig } from "./config";
import { deriveMarkets } from "./markets";
import { poissonProbability } from "./poisson";
import { calculateExpectedGoals } from "./xg";

export function predictMatch(input: MatchInput): MatchPrediction {
  if (input.homeTeamId === input.awayTeamId) throw new Error("Home and away teams must differ.");

  const config = resolveModelConfig(input.config);
  const homeTeam = getTeamById(input.homeTeamId);
  const awayTeam = getTeamById(input.awayTeamId);
  const { expectedGoals, breakdown } = calculateExpectedGoals(homeTeam, awayTeam, config);

  const scoreMatrix: ScoreProbability[] = [];
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let homeGoals = 0; homeGoals <= config.maxGoals; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= config.maxGoals; awayGoals += 1) {
      const probability = poissonProbability(expectedGoals.home, homeGoals) * poissonProbability(expectedGoals.away, awayGoals);
      scoreMatrix.push({ homeGoals, awayGoals, probability });
      if (homeGoals > awayGoals) homeWin += probability;
      if (homeGoals === awayGoals) draw += probability;
      if (homeGoals < awayGoals) awayWin += probability;
    }
  }

  const coveredMass = scoreMatrix.reduce((sum, score) => sum + score.probability, 0);
  const normalizationFactor = 1 / coveredMass;

  const normalizedMatrix = scoreMatrix.map((score) => ({
    ...score,
    probability: score.probability * normalizationFactor,
  }));

  const outcomes = {
    homeWin: homeWin * normalizationFactor,
    draw: draw * normalizationFactor,
    awayWin: awayWin * normalizationFactor,
  };

  return {
    homeTeam,
    awayTeam,
    expectedGoals,
    outcomes,
    scoreMatrix: normalizedMatrix,
    topScores: [...normalizedMatrix].sort((a, b) => b.probability - a.probability).slice(0, 8),
    markets: [],
    breakdown,
    config,
    coveredMass,
    modelNotes: [
      "Deterministisches 1X2-Modell ohne Zufallswerte: alle Werte entstehen aus Teamprofilen und Modellgewichten.",
      "xG wird aus Base-Rate, Attack, gegnerischer Defense, Elo, Form, aktuellem xG-Signal und Heimvorteil berechnet.",
      "Poisson-Verteilungen erzeugen das vollständige Scoregrid; sichtbare Märkte werden aus der Score-Matrix summiert.",
      "Der Data Provider ist austauschbar und für echte Football-Data-APIs, Caching und spätere ML-Ensembles vorbereitet."
    ]
  };
}
