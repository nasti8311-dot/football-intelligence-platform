import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    pages: [
      "/",
      "/verified-picks",
      "/quant-hub",
      "/model-quality",
      "/performance",
      "/value-analysis",
      "/xg-lab",
      "/readiness",
      "/status",
      "/launch-checklist",
      "/methodology",
      "/public-track-record",
      "/about",
      "/roadmap",
      "/changelog",
      "/contact",
      "/disclaimer",
    ],
  });
}
