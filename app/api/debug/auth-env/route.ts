import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
    AUTH_GOOGLE_ID: Boolean(process.env.AUTH_GOOGLE_ID),
    AUTH_GOOGLE_SECRET: Boolean(process.env.AUTH_GOOGLE_SECRET),
    AUTH_URL: process.env.AUTH_URL || null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
  });
}
