import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshots = (await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int as count
      FROM "PredictionSnapshot"
    `).catch(() => [{ count: 0 }])) as any[];

    const matches = (await prisma.$queryRawUnsafe(`
      SELECT COUNT(*)::int as count
      FROM "Match"
    `).catch(() => [{ count: 0 }])) as any[];

    return NextResponse.json({
      ok: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      snapshots: snapshots[0]?.count || 0,
      matches: matches[0]?.count || 0,
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      status: "error",
      error: e?.message || "Unknown error",
    }, { status: 500 });
  }
}
