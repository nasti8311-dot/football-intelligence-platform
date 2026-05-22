import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    title: "Football IQ - Quantitative Football Intelligence",
    description:
      "Datengetriebene Fußballprognosen mit Verified Picks, Calibration, Track Record und Modelltransparenz.",
    keywords: [
      "football predictions",
      "football analytics",
      "verified picks",
      "xG model",
      "football quant",
      "sports analytics",
      "football intelligence",
    ],
    publicPages: [
      "/verified-picks",
      "/methodology",
      "/public-track-record",
      "/model-quality",
      "/quant-hub",
    ],
  });
}
