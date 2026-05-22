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
    const oddsRows =
      (m.bookmakerOdds?.length || 0) +
      (m.odds?.length || 0);

    return {
      match: `${m.homeTeam?.name} vs ${m.awayTeam?.name}`,
      league: m.league?.name || "Unknown",
      kickoff: m.kickoff,
      oddsRows,
      issue:
        oddsRows <= 0
          ? "NO_ODDS"
          : oddsRows < 3
            ? "LOW_ODDS_DEPTH"
            : "OK",
    };
  });

  return NextResponse.json({
    total: rows.length,
    noOdds: rows.filter((r) => r.issue === "NO_ODDS").length,
    lowOddsDepth: rows.filter((r) => r.issue === "LOW_ODDS_DEPTH").length,
    ok: rows.filter((r) => r.issue === "OK").length,
    rows,
  });
}
