const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i]?.trim();
    });
    return row;
  });
}

function parseDate(date, time = "15:00") {
  let d, m, y;

  if (date.includes("/")) {
    [d, m, y] = date.split("/");
  } else {
    const parts = date.split("-");
    if (parts[0].length === 4) {
      [y, m, d] = parts;
    } else {
      [d, m, y] = parts;
    }
  }

  if (y.length === 2) y = "20" + y;

  return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${time}:00.000Z`);
}

async function upsertTeam(name) {
  const id = slug(name);

  return prisma.team.upsert({
    where: { id },
    update: {
      name,
      shortName: name,
    },
    create: {
      id,
      name,
      shortName: name,
      attack: 50,
      defense: 50,
      elo: 1500,
      form: 0,
      xgFor: 0,
      xgAgainst: 0,
    },
  });
}

async function main() {
  const file = process.argv[2];

  if (!file) {
    console.log("Usage: node import-fixtures.js fixtures.csv");
    process.exit(1);
  }

  const rows = parseCSV(fs.readFileSync(file, "utf8"));

  let imported = 0;
  let skipped = 0;

  for (const r of rows) {
    const div = r.Div || "CUSTOM";
    const home = r.HomeTeam;
    const away = r.AwayTeam;
    const date = r.Date;
    const time = r.Time || "15:00";

    if (!home || !away || !date) {
      skipped++;
      continue;
    }

    const kickoff = parseDate(date, time);

    const league = await prisma.league.upsert({
      where: { code: div },
      update: {},
      create: {
        code: div,
        name: div,
        country: "Unknown",
      },
    });

    const homeTeam = await upsertTeam(home);
    const awayTeam = await upsertTeam(away);

    const sourceId = `${div}-fixture-${date}-${time}-${slug(home)}-${slug(away)}`;

    await prisma.match.upsert({
      where: {
        source_sourceId: {
          source: "fixture-import",
          sourceId,
        },
      },
      update: {
        kickoff,
        status: "SCHEDULED",
        homeGoals: null,
        awayGoals: null,
      },
      create: {
        leagueId: league.id,
        season: "2026/27",
        kickoff,
        status: "SCHEDULED",
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeGoals: null,
        awayGoals: null,
        source: "fixture-import",
        sourceId,
      },
    });

    imported++;
  }

  console.log({ imported, skipped });

  const upcoming = await prisma.match.count({
    where: {
      kickoff: { gt: new Date() },
    },
  });

  console.log("Upcoming now:", upcoming);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
