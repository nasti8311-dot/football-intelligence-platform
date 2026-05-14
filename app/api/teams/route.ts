import { NextResponse } from "next/server";
import { teams } from "@/data/teams";
import { listTeamsFromDb } from "@/lib/db/repositories/team-repository";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ source: "static-fallback", teams });
    return NextResponse.json({ source: "database", teams: await listTeamsFromDb() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    return NextResponse.json({ source: "static-fallback", warning: message, teams });
  }
}
