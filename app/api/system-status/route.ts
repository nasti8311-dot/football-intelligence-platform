import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    model: "poisson-xg",
    picks: "active",
    updated: new Date().toISOString(),
  });
}
