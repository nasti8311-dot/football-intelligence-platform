import type { ModelConfig } from "@/lib/types/football";

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  maxGoals: 6,
  homeBaseXg: 1.48,
  awayBaseXg: 1.18,
  formWeight: 0.075,
  xgSignalWeight: 0.32,
  eloWeight: 0.28,
  homeAdvantage: 1.08,
};

export function resolveModelConfig(config?: Partial<ModelConfig>): ModelConfig {
  return { ...DEFAULT_MODEL_CONFIG, ...config };
}
