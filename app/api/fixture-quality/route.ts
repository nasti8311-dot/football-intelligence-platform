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
    take: 300,
  });

  const rows = matches.map((m) => {
    const oddsRows = (m.bookmakerOdds?.length || 0) + (m.odds?.length || 0);

    const quality =
      oddsRows >= 10
        ? "HIGH"
        : oddsRows >= 3
          ? "MEDIUM"
          : oddsRows > 0
            ? "LOW"
            : "NO_ODDS";

    return {
      matchId: m.id,
      match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
      league: m.league?.name,
      kickoff: m.kickoff,
      oddsRows,
      quality,
    };
  });

  return NextResponse.json({
    total: rows.length,
    high: rows.filter((r) => r.quality === "HIGH").length,
    medium: rows.filter((r) => r.quality === "MEDIUM").length,
    low: rows.filter((r) => r.quality === "LOW").length,
    noOdds: rows.filter((r) => r.quality === "NO_ODDS").length,
    rows,
  });
}
