import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const competitions = ["BL1", "PL", "PD", "SA", "FL1"];

function sourceCode(code: string) {
  return code;
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Missing FOOTBALL_DATA_API_KEY" }, { status: 500 });
  }

  const results = [];

  for (const code of competitions) {
    try {
      const url = `https://api.football-data.org/v4/competitions/${sourceCode(code)}/matches?status=FINISHED`;

      const res = await fetch(url, {
        headers: { "X-Auth-Token": apiKey },
        cache: "no-store",
      });

      if (!res.ok) {
        results.push({ code, error: `${res.status} ${await res.text()}` });
        continue;
      }

      const data = await res.json();
      const matches = data.matches || [];

      let updated = 0;

      for (const m of matches.slice(-120)) {
        const sourceId = String(m.id);
        const homeGoals = m.score?.fullTime?.home;
        const awayGoals = m.score?.fullTime?.away;

        if (homeGoals === null || homeGoals === undefined || awayGoals === null || awayGoals === undefined) {
          continue;
        }

        const existing = await prisma.match.findFirst({
          where: {
            source: "football-data-api",
            sourceId,
          },
        });

        if (!existing) continue;

        await prisma.match.update({
          where: { id: existing.id },
          data: {
            status: "FINISHED",
            homeGoals: Number(homeGoals),
            awayGoals: Number(awayGoals),
          },
        });

        updated++;
      }

      results.push({ code, apiMatches: matches.length, updated });
    } catch (e: any) {
      results.push({ code, error: e?.message || "Unknown error" });
    }
  }

  return NextResponse.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    results,
  });
}
