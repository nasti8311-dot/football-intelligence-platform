import { prisma } from "@/lib/db/prisma";
import type { TeamProfile } from "@/lib/types/football";

function toTeamProfile(team: any): TeamProfile {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    league: team.league?.name ?? "Unknown League",
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

export async function listTeamsFromDb(): Promise<TeamProfile[]> {
  const teams = await prisma.team.findMany({ include: { league: true }, orderBy: [{ league: { name: "asc" } }, { elo: "desc" }] });
  return teams.map(toTeamProfile);
}

export async function getTeamFromDb(id: string): Promise<TeamProfile | undefined> {
  const team = await prisma.team.findUnique({ where: { id }, include: { league: true } });
  return team ? toTeamProfile(team) : undefined;
}
