import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  if (!teamId) {
    return NextResponse.json(
      { error: "teamId fehlt" },
      { status: 400 }
    );
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeTeamId: teamId },
        { awayTeamId: teamId },
      ],
      homeGoals: {
        not: null,
      },
      awayGoals: {
        not: null,
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
    orderBy: {
      kickoff: "desc",
    },
    take: 10,
  });

  const form = matches.map((match) => {
    const isHome = match.homeTeamId === teamId;
    const goalsFor = isHome ? match.homeGoals : match.awayGoals;
    const goalsAgainst = isHome ? match.awayGoals : match.homeGoals;

    let result = "D";
    if ((goalsFor ?? 0) > (goalsAgainst ?? 0)) result = "W";
    if ((goalsFor ?? 0) < (goalsAgainst ?? 0)) result = "L";

    return {
      id: match.id,
      kickoff: match.kickoff,
      opponent: isHome ? match.awayTeam.name : match.homeTeam.name,
      home: isHome,
      goalsFor,
      goalsAgainst,
      result,
      league: match.league?.name || null,
    };
  });

  const wins = form.filter((m) => m.result === "W").length;
  const draws = form.filter((m) => m.result === "D").length;
  const losses = form.filter((m) => m.result === "L").length;

  const goalsFor = form.reduce((sum, m) => sum + Number(m.goalsFor || 0), 0);
  const goalsAgainst = form.reduce(
    (sum, m) => sum + Number(m.goalsAgainst || 0),
    0
  );

  return NextResponse.json({
    teamId,
    sampleSize: form.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalsForPerGame:
      form.length > 0 ? Number((goalsFor / form.length).toFixed(2)) : null,
    goalsAgainstPerGame:
      form.length > 0 ? Number((goalsAgainst / form.length).toFixed(2)) : null,
    form,
  });
}
