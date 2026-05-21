import { prisma } from "@/lib/prisma";

export async function getTeamFormMap(teamIds: string[]) {
  const uniqueIds = [...new Set(teamIds.filter(Boolean))];

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeamId: { in: uniqueIds } },
        { awayTeamId: { in: uniqueIds } },
      ],
      homeGoals: { not: null },
      awayGoals: { not: null },
    },
    orderBy: {
      kickoff: "desc",
    },
    take: 2000,
  });

  const formMap = new Map<string, any>();

  for (const teamId of uniqueIds) {
    const recent = matches
      .filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId)
      .slice(0, 5);

    let points = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const match of recent) {
      const isHome = match.homeTeamId === teamId;

      const gf = isHome ? match.homeGoals || 0 : match.awayGoals || 0;
      const ga = isHome ? match.awayGoals || 0 : match.homeGoals || 0;

      goalsFor += gf;
      goalsAgainst += ga;

      if (gf > ga) points += 3;
      else if (gf === ga) points += 1;
    }

    formMap.set(teamId, {
      sampleSize: recent.length,
      points,
      goalsFor,
      goalsAgainst,
      goalsForPerGame: recent.length ? goalsFor / recent.length : null,
      goalsAgainstPerGame: recent.length ? goalsAgainst / recent.length : null,
      formString: recent
        .map((match) => {
          const isHome = match.homeTeamId === teamId;
          const gf = isHome ? match.homeGoals || 0 : match.awayGoals || 0;
          const ga = isHome ? match.awayGoals || 0 : match.homeGoals || 0;

          if (gf > ga) return "W";
          if (gf === ga) return "D";
          return "L";
        })
        .join(""),
    });
  }

  return formMap;
}
