export const ELITE_LEAGUES = [
  "soccer epl",
  "premier league",
  "soccer spain la liga",
  "soccer italy serie a",
  "soccer germany bundesliga",
  "soccer france ligue one",
  "soccer usa mls",
  "soccer uefa champions league",
];

export function isEliteLeague(name?: string) {
  if (!name) return false;
  const l = name.toLowerCase();
  return ELITE_LEAGUES.some(x => l.includes(x));
}
