import { prisma } from "@/lib/prisma";

export type AdvancedTeamForm = {
  teamId: string;
  teamName: string;
  played: number;
  goalsFor: number;
  goalsAgainst: number;
  attackStrength: number;
  defenseStrength: number;
  homeAttack: number;
  awayAttack: number;
  formIndex: number;
  recent: number[];
};

function ensure(map: Record<string, any>, teamId: string, teamName: string) {
  if (!map[teamId]) {
    map[teamId] = {
      teamId,
      teamName,
      played: 0,
      homePlayed: 0,
      awayPlayed: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      homeGoalsFor: 0,
      homeGoalsAgainst: 0,
      awayGoalsFor: 0,
      awayGoalsAgainst: 0,
      formPoints: 0,
      recent: [],
    };
  }

  return map[teamId];
}

export async function buildTeamFormMap() {
  const matches = await prisma.match.findMany({
    where: {
      homeGoals: {
        not: null,
      },
      awayGoals: {
        not: null,
      },
    },
    orderBy: {
      kickoff: "desc",
    },
    take: 4000,
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  const map: Record<string, any> = {};

  for (const match of matches) {
    const homeGoals = Number(match.homeGoals);
    const awayGoals = Number(match.awayGoals);

    if (
      Number.isNaN(homeGoals) ||
      Number.isNaN(awayGoals)
    ) {
      continue;
    }

    const home = ensure(
      map,
      match.homeTeamId,
      match.homeTeam?.name || match.homeTeamId
    );

    const away = ensure(
      map,
      match.awayTeamId,
      match.awayTeam?.name || match.awayTeamId
    );

    home.played++;
    home.homePlayed++;
    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;
    home.homeGoalsFor += homeGoals;
    home.homeGoalsAgainst += awayGoals;

    away.played++;
    away.awayPlayed++;
    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;
    away.awayGoalsFor += awayGoals;
    away.awayGoalsAgainst += homeGoals;

    const homePts =
      homeGoals > awayGoals
        ? 3
        : homeGoals === awayGoals
          ? 1
          : 0;

    const awayPts =
      awayGoals > homeGoals
        ? 3
        : homeGoals === awayGoals
          ? 1
          : 0;

    home.formPoints += homePts;
    away.formPoints += awayPts;

    if (home.recent.length < 5) {
      home.recent.push(homePts);
    }

    if (away.recent.length < 5) {
      away.recent.push(awayPts);
    }
  }

  for (const team of Object.values(map)) {
    team.attackStrength =
      team.played > 0
        ? team.goalsFor / team.played
        : 1;

    team.defenseStrength =
      team.played > 0
        ? team.goalsAgainst / team.played
        : 1;

    team.homeAttack =
      team.homePlayed > 0
        ? team.homeGoalsFor / team.homePlayed
        : team.attackStrength;

    team.awayAttack =
      team.awayPlayed > 0
        ? team.awayGoalsFor / team.awayPlayed
        : team.attackStrength;

    team.formIndex =
      team.recent.length > 0
        ? team.recent.reduce((a: number, b: number) => a + b, 0) /
          (team.recent.length * 3)
        : 0.5;
  }

  return map as Record<string, AdvancedTeamForm>;
}
