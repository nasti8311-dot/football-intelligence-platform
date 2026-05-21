import { prisma } from "@/lib/prisma";

export async function getTeamFormMap(teamIds: string[]) {
  const uniqueIds = [...new Set(teamIds)];

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        {
          homeTeamId: {
            in: uniqueIds,
          },
        },
        {
          awayTeamId: {
            in: uniqueIds,
          },
        },
      ],
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
    take: 2000,
  });

  const formMap = new Map();

  for (const teamId of uniqueIds) {
    const recent = matches
      .filter(
        (m) =>
          m.homeTeamId === teamId ||
          m.awayTeamId === teamId
      )
      .slice(0, 5);

    let points = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const match of recent) {
      const isHome =
        match.homeTeamId === teamId;

      const gf = isHome
        ? match.homeGoals || 0
        : match.awayGoals || 0;

      const ga = isHome
        ? match.awayGoals || 0
        : match.homeGoals || 0;

      goalsFor += gf;
      goalsAgainst += ga;

      if (gf > ga) points += 3;
      else if (gf === ga) points += 1;
    }

    formMap.set(teamId, {
      matches: recent.length,
      points,
      goalsFor,
      goalsAgainst,
      ppg:
        recent.length > 0
          ? points / recent.length
          : 0,
    });
  }

  return formMap;
}
