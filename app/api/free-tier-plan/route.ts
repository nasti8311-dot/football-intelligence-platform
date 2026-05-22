import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    strategy: "FREE_TIER_OPTIMIZED",
    rules: [
      "Nur Top-Ligen synchronisieren",
      "Nur 3-Tage-Fenster verwenden",
      "Odds-Sync manuell oder maximal 1x täglich",
      "Verified Picks nur mit OddsRows > 0",
      "Keine Fake-Predictions ohne Marktpreise veröffentlichen",
    ],
    recommendedSportsKeys: [
      "soccer_epl",
      "soccer_spain_la_liga",
      "soccer_italy_serie_a",
      "soccer_germany_bundesliga",
      "soccer_uefa_champs_league",
    ],
  });
}
