import { NextResponse } from "next/server";
import { listRecentPredictions } from "@/lib/db/repositories/prediction-repository";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured." }, { status: 501 });
    }
    return NextResponse.json({ predictions: await listRecentPredictions() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
