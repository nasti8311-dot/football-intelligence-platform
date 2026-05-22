import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    publicPages: [
      "/",
      "/about",
      "/methodology",
      "/verified-picks",
      "/public-track-record",
      "/disclaimer",
      "/contact",
      "/changelog",
      "/roadmap",
    ],
    quantPages: [
      "/quant-hub",
      "/model-quality",
      "/performance",
      "/value-analysis",
      "/xg-lab",
      "/readiness",
      "/status",
      "/launch-checklist",
    ],
    apiEndpoints: [
      "/api/data-health",
      "/api/model-readiness",
      "/api/launch-checklist",
      "/api/odds-coverage",
      "/api/verified-picks-health",
      "/api/calibration-report",
      "/api/public-summary",
      "/api/quant-summary",
    ],
  });
}
