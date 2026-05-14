export type TeamId = string;

export interface TeamProfile {
  id: TeamId;
  name: string;
  shortName: string;
  league: string;
  attack: number; // 1.00 = league average attacking output
  defense: number; // 1.00 = league average defensive solidity; higher is better
  elo: number;
  form: number; // recent normalized form in [-1, 1]
  xgFor: number;
  xgAgainst: number;
  possession?: number;
  pressing?: number;
  tempo?: number;
}

export interface ModelConfig {
  maxGoals: number;
  homeBaseXg: number;
  awayBaseXg: number;
  formWeight: number;
  xgSignalWeight: number;
  eloWeight: number;
  homeAdvantage: number;
}

export interface MatchInput {
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  config?: Partial<ModelConfig>;
}

export interface ScoreProbability {
  homeGoals: number;
  awayGoals: number;
  probability: number;
}

export interface BettingMarket {
  label: string;
  probability: number;
  fairOdds: number;
  explanation: string;
}

export interface ModelBreakdown {
  home: Record<string, number>;
  away: Record<string, number>;
}

export interface MatchPrediction {
  homeTeam: TeamProfile;
  awayTeam: TeamProfile;
  expectedGoals: {
    home: number;
    away: number;
  };
  outcomes: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  scoreMatrix: ScoreProbability[];
  topScores: ScoreProbability[];
  markets: BettingMarket[];
  breakdown: ModelBreakdown;
  config: ModelConfig;
  coveredMass: number;
  modelNotes: string[];
}
