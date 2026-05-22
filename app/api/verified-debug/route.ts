import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
        lte: in3Days,
      },
    },
    include: {
      league: true,
      homeTeam: true,
      awayTeam: true,
      bookmakerOdds: true,
      odds: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 100,
  });

  return NextResponse.json({
    total: matches.length,
    rows: matches.map((m) => {
      const oddsRows =
        (m.bookmakerOdds?.length || 0) +
        (m.odds?.length || 0);

      return {
        match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
        league: m.league?.name,
        kickoff: m.kickoff,
        oddsRows,
        canEvaluate: oddsRows > 0,
      };
    }),
  });
}
