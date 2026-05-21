import { prisma } from "@/lib/prisma";

function points(result: string, isHome: boolean) {
  if (!result) return 0;

  const [h, a] = result.split(":").map(Number);

  if (Number.isNaN(h) || Number.isNaN(a)) return 0;

  if (h === a) return 1;

  const won = isHome ? h > a : a > h;

  return won ? 3 : 0;
}

export async function buildTeamFormMap() {
  const matches = await prisma.match.findMany({
    where: {
      status: "FINISHED",
      result: {
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

  const map: any = {};

  function ensure(teamId: string, teamName: string) {
    if (!map[teamId]) {
      map[teamId] = {
        teamId,
        teamName,

        played: 0,

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

  for (const match of matches) {
    if (!match.result) continue;

    const [homeGoals, awayGoals] = match.result
      .split(":")
      .map(Number);

    if (
      Number.isNaN(homeGoals) ||
      Number.isNaN(awayGoals)
    ) {
      continue;
    }

    const home = ensure(
      match.homeTeamId,
      match.homeTeam?.name || match.homeTeamId
    );

    const away = ensure(
      match.awayTeamId,
      match.awayTeam?.name || match.awayTeamId
    );

    home.played++;
    away.played++;

    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;

    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    home.homeGoalsFor += homeGoals;
    home.homeGoalsAgainst += awayGoals;

    away.awayGoalsFor += awayGoals;
    away.awayGoalsAgainst += homeGoals;

    const homePts = points(match.result, true);
    const awayPts = points(match.result, false);

    home.formPoints += homePts;
    away.formPoints += awayPts;

    if (home.recent.length < 5) {
      home.recent.push(homePts);
    }

    if (away.recent.length < 5) {
      away.recent.push(awayPts);
    }
  }

  for (const team of Object.values(map) as any[]) {
    team.attackStrength =
      team.played > 0
        ? team.goalsFor / team.played
        : 1;

    team.defenseStrength =
      team.played > 0
        ? team.goalsAgainst / team.played
        : 1;

    team.homeAttack =
      team.played > 0
        ? team.homeGoalsFor / Math.max(1, team.played / 2)
        : 1;

    team.awayAttack =
      team.played > 0
        ? team.awayGoalsFor / Math.max(1, team.played / 2)
        : 1;

    team.formIndex =
      team.recent.length > 0
        ? team.recent.reduce((a: number, b: number) => a + b, 0) /
          (team.recent.length * 3)
        : 0.5;
  }

  return map;
}
