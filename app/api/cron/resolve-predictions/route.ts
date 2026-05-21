import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function resolvePick({
  pick,
  homeGoals,
  awayGoals,
}: {
  pick: string;
  homeGoals: number;
  awayGoals: number;
}) {
  const p = normalize(pick);
  const totalGoals = homeGoals + awayGoals;

  if (p.includes("heimsieg")) {
    return homeGoals > awayGoals;
  }

  if (p.includes("auswärtssieg") || p.includes("auswaertssieg")) {
    return awayGoals > homeGoals;
  }

  if (p.includes("remis") || p.includes("draw")) {
    return homeGoals === awayGoals;
  }

  if (p.includes("über 2,5") || p.includes("ueber 2,5") || p.includes("over 2.5")) {
    return totalGoals > 2.5;
  }

  if (p.includes("unter 2,5") || p.includes("under 2.5")) {
    return totalGoals < 2.5;
  }

  if (p.includes("btts") || p.includes("beide")) {
    return homeGoals > 0 && awayGoals > 0;
  }

  return null;
}

export async function GET() {
  const snapshots = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: null,
      match: {
        homeGoals: {
          not: null,
        },
        awayGoals: {
          not: null,
        },
      },
    },
    include: {
      match: true,
    },
    take: 500,
  });

  let resolved = 0;
  let skipped = 0;

  for (const snapshot of snapshots) {
    const homeGoals = snapshot.match.homeGoals;
    const awayGoals = snapshot.match.awayGoals;

    if (homeGoals == null || awayGoals == null) {
      skipped++;
      continue;
    }

    const isCorrect = resolvePick({
      pick: snapshot.pick,
      homeGoals,
      awayGoals,
    });

    if (isCorrect == null) {
      skipped++;
      continue;
    }

    await prisma.predictionSnapshot.update({
      where: {
        id: snapshot.id,
      },
      data: {
        result: `${homeGoals}-${awayGoals}`,
        isCorrect,
      },
    });

    resolved++;
  }

  return NextResponse.json({
    ok: true,
    checked: snapshots.length,
    resolved,
    skipped,
  });
}
