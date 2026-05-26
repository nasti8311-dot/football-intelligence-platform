export const LEAGUE_GOAL_FACTORS: Record<string, number> = {
  "soccer epl": 1.00,
  "premier league": 1.00,

  "soccer germany bundesliga": 1.08,
  "bundesliga": 1.08,

  "soccer italy serie a": 0.90,
  "serie a": 0.90,

  "soccer spain la liga": 0.93,
  "la liga": 0.93,

  "soccer france ligue 1": 0.96,

  "soccer usa mls": 1.18,

  "soccer netherlands ered": 1.12,

  "soccer belgium first div": 1.10,
};

export function getLeagueFactor(league?: string | null) {
  if (!league) return 1;

  const key = league.toLowerCase();

  return LEAGUE_GOAL_FACTORS[key] || 1;
}
