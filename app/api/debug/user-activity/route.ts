import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserActivity" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "email" TEXT NOT NULL,
      "name" TEXT,
      "path" TEXT,
      "event" TEXT NOT NULL DEFAULT 'page_view',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const overview = (await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*)::int as events,
      COUNT(DISTINCT email)::int as users
    FROM "UserActivity"
  `).catch(() => [{ events: 0, users: 0 }])) as any[];

  const recent = (await prisma.$queryRawUnsafe(`
    SELECT email, name, path, event, "createdAt"
    FROM "UserActivity"
    ORDER BY "createdAt" DESC
    LIMIT 50
  `).catch(() => [])) as any[];

  return NextResponse.json({
    ok: true,
    overview: overview[0],
    recent,
  });
}
