import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());

  return lines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

function num(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCsv(text);

  const events = rows.map((r) => ({
    matchId: String(r.matchId),
    team: String(r.team),
    player: r.player ? String(r.player) : null,
    eventType: String(r.eventType),
    minute: Number(r.minute || 0),
    x: num(String(r.x ?? "")),
    y: num(String(r.y ?? "")),
    endX: num(String(r.endX ?? "")),
    endY: num(String(r.endY ?? "")),
    xg: num(String(r.xg ?? "")),
    outcome: String(r.outcome || ""),
  }));

  await prisma.event.createMany({
    data: events,
    skipDuplicates: true,
  });

  return NextResponse.json({
    imported: events.length,
  });
}
