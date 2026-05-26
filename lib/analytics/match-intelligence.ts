import type { Match, MatchOdds, MatchStat, Team, League } from "@prisma/client";
import { resolveModelConfig } from "@/lib/model/config";
import { calculateExpectedGoals } from "@/lib/model/xg";
import { poissonProbability } from "@/lib/model/poisson";
import { deriveMarkets } from "@/lib/model/markets";
import type { ScoreProbability, TeamProfile } from "@/lib/types/football";

export type MatchWithIntelligence = Match & {
  homeTeam: Team;
  awayTeam: Team;
  league: League | null;
  stats: MatchStat | null;
  odds: MatchOdds[];
};

export type ValuePick = {
  market: "Home" | "Draw" | "Away";
  modelProbability: number;
  marketProbability: number;
  fairOdds: number;
  offeredOdds: number;
  edge: number;
  kellyFraction: number;
};

export type ScenarioBucket = {
  label: string;
  probability: number;
  explanation: string;
};

export function teamToProfile(team: Team, leagueName = "Imported League"): TeamProfile {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    league: leagueName,
    attack: team.attack,
    defense: team.defense,
    elo: team.elo,
    form: team.form,
    xgFor: team.xgFor,
    xgAgainst: team.xgAgainst,
    possession: team.possession ?? undefined,
    pressing: team.pressing ?? undefined,
    tempo: team.tempo ?? undefined,
  };
}

export function predictFromDbTeams(homeTeam: Team, awayTeam: Team, leagueName?: string) {
  const config = resolveModelConfig({ maxGoals: 8 });
  const home = teamToProfile(homeTeam, leagueName);
  const away = teamToProfile(awayTeam, leagueName);
  const { expectedGoals, breakdown } = calculateExpectedGoals(home, away, config);

  const scoreMatrix: ScoreProbability[] = [];
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let homeGoals = 0; homeGoals <= config.maxGoals; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= config.maxGoals; awayGoals += 1) {
      const probability = poissonProbability(expectedGoals.home, homeGoals) * poissonProbability(expectedGoals.away, awayGoals);
      scoreMatrix.push({ homeGoals, awayGoals, probability });
      if (homeGoals > awayGoals) homeWin += probability;
      else if (homeGoals === awayGoals) draw += probability;
      else awayWin += probability;
    }
  }

  const coveredMass = scoreMatrix.reduce((sum, score) => sum + score.probability, 0);
  const normalizationFactor = 1 / coveredMass;
  const normalizedMatrix = scoreMatrix.map((score) => ({ ...score, probability: score.probability * normalizationFactor }));

  return {
    homeTeam: home,
    awayTeam: away,
    expectedGoals,
    outcomes: {
      homeWin: homeWin * normalizationFactor,
      draw: draw * normalizationFactor,
      awayWin: awayWin * normalizationFactor,
    },
    scoreMatrix: normalizedMatrix,
    topScores: [...normalizedMatrix].sort((a, b) => b.probability - a.probability).slice(0, 10),
    markets: deriveMarkets(home.xgFor, away.xgFor),
    breakdown,
    config,
    coveredMass,
  };
}

export function buildScenarioBuckets(scoreMatrix: ScoreProbability[]): ScenarioBucket[] {
  const sum = (predicate: (score: ScoreProbability) => boolean) =>
    scoreMatrix.filter(predicate).reduce((acc, score) => acc + score.probability, 0);

  return [
    {
      label: "Low-event control game",
      probability: sum((s) => s.homeGoals + s.awayGoals <= 2),
      explanation: "0–2 Gesamttore; typisches Szenario für kompakte Defensivspiele.",
    },
    {
      label: "Open tactical game",
      probability: sum((s) => s.homeGoals + s.awayGoals >= 4),
      explanation: "4+ Gesamttore; hohes Tempo, frühe Führung oder starke Transition-Phasen.",
    },
    {
      label: "Home control",
      probability: sum((s) => s.homeGoals > s.awayGoals && s.homeGoals - s.awayGoals >= 2),
      explanation: "Heimsieg mit mindestens zwei Toren Abstand.",
    },
    {
      label: "Away upset/control",
      probability: sum((s) => s.awayGoals > s.homeGoals),
      explanation: "Auswärtsteam gewinnt; inklusive knapper und klarer Auswärtssiege.",
    },
    {
      label: "Both teams score",
      probability: sum((s) => s.homeGoals > 0 && s.awayGoals > 0),
      explanation: "Beide Teams treffen mindestens einmal.",
    },
  ].sort((a, b) => b.probability - a.probability);
}

export function deriveValuePicks(match: MatchWithIntelligence, prediction: ReturnType<typeof predictFromDbTeams>): ValuePick[] {
  const odds = match.odds[0];
  if (!odds) return [];

  const candidates = [
    { market: "Home" as const, probability: prediction.outcomes.homeWin, offeredOdds: odds.homeOdds },
    { market: "Draw" as const, probability: prediction.outcomes.draw, offeredOdds: odds.drawOdds },
    { market: "Away" as const, probability: prediction.outcomes.awayWin, offeredOdds: odds.awayOdds },
  ];

  return candidates
    .filter((candidate): candidate is typeof candidate & { offeredOdds: number } => Boolean(candidate.offeredOdds && candidate.offeredOdds > 1))
    .map((candidate) => {
      const marketProbability = 1 / candidate.offeredOdds;
      const fairOdds = 1 / candidate.probability;
      const edge = candidate.probability - marketProbability;
      const b = candidate.offeredOdds - 1;
      const kellyFraction = Math.max(0, (b * candidate.probability - (1 - candidate.probability)) / b);
      return {
        market: candidate.market,
        modelProbability: candidate.probability,
        marketProbability,
        fairOdds,
        offeredOdds: candidate.offeredOdds,
        edge,
        kellyFraction,
      };
    })
    .sort((a, b) => b.edge - a.edge);
}
