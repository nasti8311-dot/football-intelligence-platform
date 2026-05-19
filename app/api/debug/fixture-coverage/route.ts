import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = (await prisma.$queryRawUnsafe(`
    SELECT
      COALESCE(l.name, 'Unknown') as league,
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE m.kickoff >= NOW())::int as upcoming,
      MIN(m.kickoff) as first_match,
      MAX(m.kickoff) as last_match
    FROM "Match" m
    LEFT JOIN "League" l ON l.id = m."leagueId"
    GROUP BY COALESCE(l.name, 'Unknown')
    ORDER BY upcoming DESC, total DESC
  `).catch(() => [])) as any[];

  return NextResponse.json({
    ok: true,
    leagues: rows,
  });
}
