import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing ODDS_API_KEY" });
  }

  const res = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`, {
    cache: "no-store",
  });

  const data = await res.json();

  const soccer = data.filter((s: any) =>
    String(s.key || "").includes("soccer")
  );

  return NextResponse.json({
    ok: true,
    soccerCount: soccer.length,
    soccer: soccer.map((s: any) => ({
      key: s.key,
      title: s.title,
      active: s.active,
      hasOutrights: s.has_outrights,
    })),
  });
}
