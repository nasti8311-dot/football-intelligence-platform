import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SavedPick" (
      "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "email" TEXT NOT NULL,
      "matchId" TEXT NOT NULL,
      "market" TEXT,
      "pick" TEXT,
      "probability" DOUBLE PRECISION,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("email","matchId")
    );
  `);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  await ensureTable();

  const rows = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "SavedPick" WHERE "email" = $1 ORDER BY "createdAt" DESC`,
    session.user.email
  ).catch(() => [])) as any[];

  return NextResponse.json({ ok: true, saved: rows });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  await ensureTable();

  const body = await req.json();

  await prisma.$executeRawUnsafe(
    `INSERT INTO "SavedPick" ("email","matchId","market","pick","probability","createdAt")
     VALUES ($1,$2,$3,$4,$5,NOW())
     ON CONFLICT ("email","matchId")
     DO UPDATE SET
      "market" = EXCLUDED."market",
      "pick" = EXCLUDED."pick",
      "probability" = EXCLUDED."probability"`,
    session.user.email,
    body.matchId,
    body.market || null,
    body.pick || null,
    body.probability ? Number(body.probability) : null
  );

  return NextResponse.json({ ok: true });
}
