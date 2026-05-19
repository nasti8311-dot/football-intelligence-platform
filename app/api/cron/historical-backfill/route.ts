import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const allowed = [
  "PL",
  "ELC",
  "PD",
  "FL1",
  "SA",
  "BL1",
  "DED",
  "PPL",
  "BSA",
  "CL",
  "EL",
  "ECL",
];

export async function GET(req: Request) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing FOOTBALL_DATA_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "PL";

  if (!allowed.includes(code)) {
    return NextResponse.json({ ok: false, error: `Invalid code ${code}` }, { status: 400 });
  }

  const res = await fetch(
    `https://api.football-data.org/v4/competitions/${code}/matches?status=FINISHED`,
    {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({
      ok: false,
      code,
      error: `${res.status} ${await res.text()}`,
    }, { status: 500 });
  }

  const data = await res.json();
  const matches = data.matches || [];

  let updated = 0;

  for (const m of matches.slice(-50)) {
    const sourceId = String(m.id);
    const homeGoals = m.score?.fullTime?.home;
    const awayGoals = m.score?.fullTime?.away;

    if (homeGoals === null || homeGoals === undefined) continue;
    if (awayGoals === null || awayGoals === undefined) continue;

    const result = await prisma.match.updateMany({
      where: {
        source: "football-data-api",
        sourceId,
      },
      data: {
        status: "FINISHED",
        homeGoals: Number(homeGoals),
        awayGoals: Number(awayGoals),
      },
    });

    updated += result.count;
  }

  return NextResponse.json({
    ok: true,
    code,
    apiMatches: matches.length,
    checked: Math.min(matches.length, 50),
    updated,
  });
}
