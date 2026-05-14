import { teams } from "@/data/teams";
import type { TeamProfile } from "@/lib/types/football";

export interface TeamProvider {
  listTeams(): Promise<TeamProfile[]>;
  getTeam(id: string): Promise<TeamProfile | undefined>;
}

export class StaticTeamProvider implements TeamProvider {
  async listTeams(): Promise<TeamProfile[]> {
    return teams;
  }

  async getTeam(id: string): Promise<TeamProfile | undefined> {
    return teams.find((team) => team.id === id);
  }
}

export class ApiTeamProvider implements TeamProvider {
  constructor(private readonly baseUrl: string) {}

  async listTeams(): Promise<TeamProfile[]> {
    const response = await fetch(`${this.baseUrl}/teams`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error("Failed to fetch teams from API.");
    return response.json();
  }

  async getTeam(id: string): Promise<TeamProfile | undefined> {
    const response = await fetch(`${this.baseUrl}/teams/${id}`, { next: { revalidate: 300 } });
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Failed to fetch team ${id}.`);
    return response.json();
  }
}
