import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { parseCsv, slugify, toFloat, toInt, toOptionalDate } from "@/lib/import/csv";
import { importFootballDataRows } from "@/lib/import/football-data";

export const dynamic = "force-dynamic";

type ImportType = "leagues" | "teams" | "matches" | "footballData";

export async function POST(request: Request) {
  const startedAt = new Date();
  const body = await request.json().catch(() => null) as { type?: ImportType; csv?: string } | null;

  if (!body?.type || !body.csv) {
    return NextResponse.json({ error: "type und csv sind erforderlich." }, { status: 400 });
  }

  const rows = parseCsv(body.csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV enthält keine Datenzeilen." }, { status: 400 });
  }

  try {
    const result = await importRows(body.type, rows);
    await prisma.apiSyncLog.create({
      data: {
        provider: "csv",
        endpoint: body.type,
        status: "SUCCESS",
        records: result.imported,
        message: `${result.imported} Datensätze importiert, ${result.skipped} übersprungen.`,
        startedAt,
        finishedAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unbekannter Importfehler";
    await prisma.apiSyncLog.create({
      data: {
        provider: "csv",
        endpoint: body.type,
        status: "ERROR",
        records: 0,
        message,
        startedAt,
        finishedAt: new Date(),
      },
    }).catch(() => undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function importRows(type: ImportType, rows: Record<string, string>[]) {
  if (type === "leagues") return importLeagues(rows);
  if (type === "teams") return importTeams(rows);
  if (type === "footballData") return importFootballDataRows(prisma, rows);
  return importMatches(rows);
}

async function importLeagues(rows: Record<string, string>[]) {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row.name;
    if (!name) {
      skipped++;
      continue;
    }

    const code = row.code || slugify(name);
    await prisma.league.upsert({
      where: { code },
      update: { name, country: row.country || null },
      create: { code, name, country: row.country || null },
    });
    imported++;
  }

  return { type: "leagues", imported, skipped };
}

async function importTeams(rows: Record<string, string>[]) {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row.name;
    if (!name) {
      skipped++;
      continue;
    }

    const id = row.id || slugify(name);
    let leagueId: string | undefined;
    if (row.leagueCode || row.leagueName) {
      const leagueCode = row.leagueCode || slugify(row.leagueName);
      const league = await prisma.league.upsert({
        where: { code: leagueCode },
        update: { name: row.leagueName || leagueCode },
        create: { code: leagueCode, name: row.leagueName || leagueCode, country: row.country || null },
      });
      leagueId = league.id;
    }

    await prisma.team.upsert({
      where: { id },
      update: {
        name,
        shortName: row.shortName || name.slice(0, 3).toUpperCase(),
        leagueId,
        attack: toFloat(row.attack, 1),
        defense: toFloat(row.defense, 1),
        elo: toInt(row.elo, 1500),
        form: toFloat(row.form, 0),
        xgFor: toFloat(row.xgFor, 1.35),
        xgAgainst: toFloat(row.xgAgainst, 1.35),
        possession: row.possession ? toFloat(row.possession) : null,
        pressing: row.pressing ? toFloat(row.pressing) : null,
        tempo: row.tempo ? toFloat(row.tempo) : null,
      },
      create: {
        id,
        name,
        shortName: row.shortName || name.slice(0, 3).toUpperCase(),
        leagueId,
        attack: toFloat(row.attack, 1),
        defense: toFloat(row.defense, 1),
        elo: toInt(row.elo, 1500),
        form: toFloat(row.form, 0),
        xgFor: toFloat(row.xgFor, 1.35),
        xgAgainst: toFloat(row.xgAgainst, 1.35),
        possession: row.possession ? toFloat(row.possession) : null,
        pressing: row.pressing ? toFloat(row.pressing) : null,
        tempo: row.tempo ? toFloat(row.tempo) : null,
        snapshots: {
          create: {
            season: row.season || "2025/26",
            matchday: row.matchday ? toInt(row.matchday) : null,
            attack: toFloat(row.attack, 1),
            defense: toFloat(row.defense, 1),
            elo: toInt(row.elo, 1500),
            form: toFloat(row.form, 0),
            xgFor: toFloat(row.xgFor, 1.35),
            xgAgainst: toFloat(row.xgAgainst, 1.35),
            possession: row.possession ? toFloat(row.possession) : null,
            pressing: row.pressing ? toFloat(row.pressing) : null,
            tempo: row.tempo ? toFloat(row.tempo) : null,
            source: "csv",
          },
        },
      },
    });
    imported++;
  }

  return { type: "teams", imported, skipped };
}

async function importMatches(rows: Record<string, string>[]) {
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const homeTeamId = row.homeTeamId || slugify(row.homeTeam || "");
    const awayTeamId = row.awayTeamId || slugify(row.awayTeam || "");
    if (!homeTeamId || !awayTeamId) {
      skipped++;
      continue;
    }

    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: homeTeamId } }),
      prisma.team.findUnique({ where: { id: awayTeamId } }),
    ]);

    if (!homeTeam || !awayTeam) {
      skipped++;
      continue;
    }

    let leagueId: string | undefined;
    if (row.leagueCode) {
      const league = await prisma.league.findUnique({ where: { code: row.leagueCode } });
      leagueId = league?.id;
    }

    await prisma.match.upsert({
      where: { source_sourceId: { source: "csv", sourceId: row.sourceId || `${homeTeamId}-${awayTeamId}-${row.kickoff || imported}` } },
      update: {
        leagueId,
        season: row.season || "2025/26",
        matchday: row.matchday ? toInt(row.matchday) : null,
        kickoff: toOptionalDate(row.kickoff),
        homeGoals: row.homeGoals ? toInt(row.homeGoals) : null,
        awayGoals: row.awayGoals ? toInt(row.awayGoals) : null,
        venue: row.venue || null,
      },
      create: {
        leagueId,
        season: row.season || "2025/26",
        matchday: row.matchday ? toInt(row.matchday) : null,
        kickoff: toOptionalDate(row.kickoff),
        homeTeamId,
        awayTeamId,
        homeGoals: row.homeGoals ? toInt(row.homeGoals) : null,
        awayGoals: row.awayGoals ? toInt(row.awayGoals) : null,
        venue: row.venue || null,
        source: "csv",
        sourceId: row.sourceId || `${homeTeamId}-${awayTeamId}-${row.kickoff || imported}`,
      },
    });
    imported++;
  }

  return { type: "matches", imported, skipped };
}
