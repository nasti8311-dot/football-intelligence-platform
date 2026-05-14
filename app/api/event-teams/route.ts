import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const teams = await prisma.event.findMany({
    distinct: ["team"],
    select: { team: true },
    orderBy: { team: "asc" },
  });

  return NextResponse.json(
    teams.map((t) => t.team).filter(Boolean)
  );
}
