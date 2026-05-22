import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: start,
        lte: end,
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
  });

  const withOdds = matches.filter(
    (m) => (m.bookmakerOdds?.length || 0) + (m.odds?.length || 0) > 0
  );

  return NextResponse.json({
    date: start.toISOString().slice(0, 10),
    totalMatches: matches.length,
    withOdds: withOdds.length,
    withoutOdds: matches.length - withOdds.length,
    matches: matches.map((m) => ({
      match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
      league: m.league?.name,
      kickoff: m.kickoff,
      oddsRows: (m.bookmakerOdds?.length || 0) + (m.odds?.length || 0),
    })),
  });
}
