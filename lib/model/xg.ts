import type { ModelBreakdown, ModelConfig, TeamProfile } from "@/lib/types/football";
import { eloStrengthMultiplier } from "./elo";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Number(value.toFixed(3));
}

export function calculateExpectedGoals(
  home: TeamProfile,
  away: TeamProfile,
  config: ModelConfig,
): { expectedGoals: { home: number; away: number }; breakdown: ModelBreakdown } {
  const elo = eloStrengthMultiplier(home.elo, away.elo, config.eloWeight);
  const homeForm = 1 + home.form * config.formWeight;
  const awayForm = 1 + away.form * config.formWeight;

  const homeXgSignal = 1 + ((home.xgFor / Math.max(away.xgAgainst, 0.25)) - 1) * config.xgSignalWeight;
  const awayXgSignal = 1 + ((away.xgFor / Math.max(home.xgAgainst, 0.25)) - 1) * config.xgSignalWeight;

  const homeDefenseSuppression = 2 - away.defense;
  const awayDefenseSuppression = 2 - home.defense;

  const homeXg = config.homeBaseXg * config.homeAdvantage * home.attack * homeDefenseSuppression * elo.home * homeForm * homeXgSignal;
  const awayXg = config.awayBaseXg * away.attack * awayDefenseSuppression * elo.away * awayForm * awayXgSignal;

  return {
    expectedGoals: {
      home: Number(clamp(homeXg, 0.15, 4.95).toFixed(2)),
      away: Number(clamp(awayXg, 0.15, 4.95).toFixed(2)),
    },
    breakdown: {
      home: {
        base: round(config.homeBaseXg),
        homeAdvantage: round(config.homeAdvantage),
        attack: round(home.attack),
        opponentDefense: round(homeDefenseSuppression),
        elo: round(elo.home),
        form: round(homeForm),
        xgSignal: round(homeXgSignal),
      },
      away: {
        base: round(config.awayBaseXg),
        attack: round(away.attack),
        opponentDefense: round(awayDefenseSuppression),
        elo: round(elo.away),
        form: round(awayForm),
        xgSignal: round(awayXgSignal),
      },
    },
  };
}
