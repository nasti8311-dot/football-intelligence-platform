import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#020617",
          color: "white",
          padding: 60,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#22d3ee",
            letterSpacing: 4,
          }}
        >
          FOOTBALL INTELLIGENCE PLATFORM
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1,
            maxWidth: 900,
          }}
        >
          Premium Football Predictions
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 32,
            color: "#cbd5e1",
            maxWidth: 900,
          }}
        >
          Form · Elo · Goal Models · Odds · Historical Calibration
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
