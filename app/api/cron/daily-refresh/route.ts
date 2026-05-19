import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

async function call(path: string) {
  const base =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${base}${path}`, {
    cache: "no-store",
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    data = { text: await res.text() };
  }

  return {
    path,
    status: res.status,
    ok: res.ok,
    data,
  };
}

export async function GET() {
  const routes = [
    "/api/cron/sync-fixtures",
    "/api/cron/sync-odds-events",
    "/api/cron/sync-odds",
    "/api/cron/sync-news",
    "/api/cron/save-predictions",
    "/api/cron/sync-results",
    "/api/cron/evaluate-predictions",
    "/api/cron/calibrate-model",
    "/api/cron/calibrate-leagues",
  ];

  const steps = [];

  for (const path of routes) {
    try {
      steps.push(await call(path));
    } catch (e: any) {
      steps.push({
        path,
        ok: false,
        error: e?.message || "Unknown error",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    steps,
  });
}
