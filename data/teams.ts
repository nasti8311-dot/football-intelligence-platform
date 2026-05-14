import type { TeamProfile } from "@/lib/types/football";

export const teams: TeamProfile[] = [
  { id: "mci", name: "Manchester City", shortName: "MCI", league: "Premier League", attack: 1.34, defense: 1.22, elo: 2028, form: 0.42, xgFor: 2.18, xgAgainst: 0.92, possession: 65, pressing: 78, tempo: 72 },
  { id: "ars", name: "Arsenal", shortName: "ARS", league: "Premier League", attack: 1.27, defense: 1.25, elo: 1996, form: 0.36, xgFor: 2.02, xgAgainst: 0.86, possession: 60, pressing: 82, tempo: 69 },
  { id: "liv", name: "Liverpool", shortName: "LIV", league: "Premier League", attack: 1.31, defense: 1.13, elo: 1987, form: 0.31, xgFor: 2.12, xgAgainst: 1.03, possession: 61, pressing: 86, tempo: 81 },
  { id: "fcb", name: "FC Bayern München", shortName: "FCB", league: "Bundesliga", attack: 1.39, defense: 1.10, elo: 2008, form: 0.28, xgFor: 2.42, xgAgainst: 1.10, possession: 63, pressing: 77, tempo: 78 },
  { id: "b04", name: "Bayer Leverkusen", shortName: "B04", league: "Bundesliga", attack: 1.25, defense: 1.20, elo: 1968, form: 0.45, xgFor: 2.05, xgAgainst: 0.89, possession: 59, pressing: 75, tempo: 70 },
  { id: "rma", name: "Real Madrid", shortName: "RMA", league: "LaLiga", attack: 1.32, defense: 1.22, elo: 2035, form: 0.38, xgFor: 2.16, xgAgainst: 0.91, possession: 57, pressing: 70, tempo: 73 },
  { id: "bar", name: "Barcelona", shortName: "BAR", league: "LaLiga", attack: 1.28, defense: 1.08, elo: 1954, form: 0.18, xgFor: 2.09, xgAgainst: 1.18, possession: 64, pressing: 74, tempo: 68 },
  { id: "psg", name: "Paris Saint-Germain", shortName: "PSG", league: "Ligue 1", attack: 1.30, defense: 1.12, elo: 1938, form: 0.24, xgFor: 2.24, xgAgainst: 1.04, possession: 62, pressing: 72, tempo: 76 },
  { id: "int", name: "Inter", shortName: "INT", league: "Serie A", attack: 1.24, defense: 1.26, elo: 1979, form: 0.34, xgFor: 1.98, xgAgainst: 0.82, possession: 56, pressing: 68, tempo: 64 },
  { id: "nap", name: "Napoli", shortName: "NAP", league: "Serie A", attack: 1.12, defense: 1.05, elo: 1876, form: 0.10, xgFor: 1.72, xgAgainst: 1.20, possession: 55, pressing: 66, tempo: 69 },
  { id: "atm", name: "Atlético Madrid", shortName: "ATM", league: "LaLiga", attack: 1.14, defense: 1.24, elo: 1909, form: 0.19, xgFor: 1.74, xgAgainst: 0.93, possession: 49, pressing: 71, tempo: 63 },
  { id: "bvb", name: "Borussia Dortmund", shortName: "BVB", league: "Bundesliga", attack: 1.18, defense: 1.02, elo: 1872, form: 0.12, xgFor: 1.91, xgAgainst: 1.27, possession: 54, pressing: 73, tempo: 75 }
];

export function getTeamById(id: string): TeamProfile {
  const team = teams.find((candidate) => candidate.id === id);
  if (!team) throw new Error(`Unknown team id: ${id}`);
  return team;
}
