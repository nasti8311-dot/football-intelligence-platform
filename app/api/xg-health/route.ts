import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildTeamFormMap } from "@/lib/team-form-engine";
import { estimateExpectedGoals } from "@/lib/xg-engine";

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
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 50,
  });

  const formMap = await buildTeamFormMap();

  const samples = matches.map((match) => {
    const home = formMap[match.homeTeamId];
    const away = formMap[match.awayTeamId];

    const xg = estimateExpectedGoals({
      home,
      away,
    });

    return {
      match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
      league: match.league?.name,
      homeSample: home?.played || 0,
      awaySample: away?.played || 0,
      homeAttack: home?.attackStrength || null,
      awayAttack: away?.attackStrength || null,
      homeXg: Number(xg.homeXg.toFixed(2)),
      awayXg: Number(xg.awayXg.toFixed(2)),
      totalXg: Number(xg.totalXg.toFixed(2)),
      tempo: xg.tempo,
    };
  });

  return NextResponse.json({
    count: samples.length,
    samples,
  });
}
