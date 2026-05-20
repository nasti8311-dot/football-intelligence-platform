import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      shortName: true,
      attack: true,
      defense: true,
      elo: true,
      form: true,
      xgFor: true,
      xgAgainst: true,
      league: {
        select: {
          name: true,
          country: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    take: 500,
  });

  return NextResponse.json({
    count: teams.length,
    teams,
  });
}
