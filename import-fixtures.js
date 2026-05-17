const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => row[h] = values[i]);
    return row;
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

    const [d, m, y] = date.includes("/")
      ? date.split("/")
      : date.split("-").reverse();

    const year = y.length === 2 ? `20${y}` : y;
    const kickoff = new Date(`${year}-${m}-${d}T${time}:00Z`);

    const league = await prisma.league.upsert({
      where: { code: div },
      update: {},
      create: {
        code: div,
        name: div,
        country: "Unknown",
      },
    });

    const homeTeam = await prisma.team.upsert({
      where: { id: slug(home) },
      update: { name: home },
      create: {
        id: slug(home),
        name: home,
      },
    });

    const awayTeam = await prisma.team.upsert({
      where: { id: slug(away) },
      update: { name: away },
      create: {
        id: slug(away),
        name: away,
      },
    });

    const sourceId = `${div}-fixture-${date}-${slug(home)}-${slug(away)}`;

    await prisma.match.upsert({
      where: { sourceId },
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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
