import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

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

  await prisma.$executeRawUnsafe(
    `INSERT INTO "UserActivity" ("email","name","path","event","createdAt")
     VALUES ($1,$2,$3,$4,NOW())`,
    session.user.email,
    session.user.name || null,
    body.path || null,
    body.event || "page_view"
  );

  return NextResponse.json({ ok: true });
}
