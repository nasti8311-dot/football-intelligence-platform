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
      bookmakerOdds: true,
      odds: true,
    },
    take: 300,
  });

  const withOdds = matches.filter(
    (m) => (m.bookmakerOdds?.length || 0) + (m.odds?.length || 0) > 0
  ).length;

  return NextResponse.json({
    upcoming3Days: matches.length,
    withOdds,
    withoutOdds: matches.length - withOdds,
    oddsCoverage: matches.length
      ? Number(((withOdds / matches.length) * 100).toFixed(1))
      : 0,
  });
}
