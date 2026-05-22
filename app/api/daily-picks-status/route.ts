import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const end = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const rows = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
      match: {
        kickoff: {
          gte: now,
          lte: end,
        },
      },
    },
    include: {
      match: {
        include: {
          bookmakerOdds: true,
          odds: true,
        },
      },
    },
  });

  const withOdds = rows.filter(
    (p) =>
      (p.match.bookmakerOdds?.length || 0) +
        (p.match.odds?.length || 0) >
      0
  );

  return NextResponse.json({
    openSnapshots3Days: rows.length,
    withOdds: withOdds.length,
    shownTarget: "3-10",
    status:
      withOdds.length >= 3
        ? "OK"
        : "LOW_PICK_AVAILABILITY",
  });
}
