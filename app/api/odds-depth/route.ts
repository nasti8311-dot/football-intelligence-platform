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
      homeTeam: true,
      awayTeam: true,
      league: true,
      bookmakerOdds: true,
      odds: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 300,
  });

  return NextResponse.json({
    total: matches.length,
    rows: matches.map((m) => {
      const bookmakerOdds = m.bookmakerOdds?.length || 0;
      const legacyOdds = m.odds?.length || 0;
      const total = bookmakerOdds + legacyOdds;

      return {
        match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
        league: m.league?.name,
        bookmakerOdds,
        legacyOdds,
        total,
        depth:
          total >= 15
            ? "STRONG"
            : total >= 6
              ? "OK"
              : total > 0
                ? "THIN"
                : "NONE",
      };
    }),
  });
}
