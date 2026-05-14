import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 501 });
    }
    const matches = await prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true, league: true },
      orderBy: [{ kickoff: "asc" }, { createdAt: "desc" }],
      take: 50,
    });
    return NextResponse.json({ matches });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
