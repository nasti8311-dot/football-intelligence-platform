import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [matches, odds, snapshots] = await Promise.all([
    prisma.match.count(),
    prisma.bookmakerOdds.count(),
    prisma.predictionSnapshot.count(),
  ]);

  return NextResponse.json({
    ok: true,
    database: "connected",
    modules: {
      matches,
      odds,
      snapshots,
    },
    checkedAt: new Date().toISOString(),
  });
}
