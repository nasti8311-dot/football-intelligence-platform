import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: now,
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

  return NextResponse.json({
    total: matches.length,
    withOdds: matches.filter((m) => (m.bookmakerOdds?.length || 0) + (m.odds?.length || 0) > 0).length,
    matches: matches.map((m) => ({
      match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
      league: m.league?.name,
      kickoff: m.kickoff,
      oddsRows: (m.bookmakerOdds?.length || 0) + (m.odds?.length || 0),
    })),
  });
}
