const axios = require("axios");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

if (!API_KEY) {
  console.log("Missing FOOTBALL_DATA_API_KEY");
  process.exit(1);
}

const competitions = [
  "BL1",
  "PL",
  "PD",
  "SA",
  "FL1",
];

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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

async function syncCompetition(code) {
  console.log("SYNC:", code);

  const url =
    `https://api.football-data.org/v4/competitions/${code}/matches?status=SCHEDULED`;

  const res = await axios.get(url, {
    headers: {
      "X-Auth-Token": API_KEY,
    },
  });

  const matches = res.data.matches || [];

  console.log("FOUND:", matches.length);

  for (const m of matches) {
    const home = m.homeTeam?.name;
    const away = m.awayTeam?.name;

    if (!home || !away) continue;

    const league = await prisma.league.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: m.competition?.name || code,
        country: m.area?.name || "Unknown",
      },
    });

    const homeTeam = await upsertTeam(home);
    const awayTeam = await upsertTeam(away);

    const sourceId = String(m.id);

    await prisma.match.upsert({
      where: {
        source_sourceId: {
          source: "football-data-api",
          sourceId,
        },
      },
      update: {
        kickoff: new Date(m.utcDate),
        status: "SCHEDULED",
      },
      create: {
        leagueId: league.id,
        season: "2026/27",
        kickoff: new Date(m.utcDate),
        status: "SCHEDULED",
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeGoals: null,
        awayGoals: null,
        source: "football-data-api",
        sourceId,
      },
    });
  }
}

async function main() {
  for (const code of competitions) {
    try {
      await syncCompetition(code);
    } catch (e) {
      console.error(code, e.response?.data || e.message);
    }
  }

  const upcoming = await prisma.match.count({
    where: {
      kickoff: { gt: new Date() },
    },
  });

  console.log("UPCOMING TOTAL:", upcoming);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
