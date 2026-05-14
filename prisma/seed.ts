import { PrismaClient, Prisma } from "@prisma/client";
import { teams } from "../data/teams";
import { resolveModelConfig } from "../lib/model/config";

const prisma = new PrismaClient();

async function main() {
  const leagueNames = Array.from(new Set(teams.map((team) => team.league)));

  for (const leagueName of leagueNames) {
    await prisma.league.upsert({
      where: { code: leagueName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
      update: { name: leagueName },
      create: {
        code: leagueName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name: leagueName,
        country: leagueName.includes("Premier") ? "England" : leagueName.includes("La Liga") ? "Spain" : leagueName.includes("Bundesliga") ? "Germany" : "International",
      },
    });
  }

  for (const team of teams) {
    const leagueCode = team.league.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const league = await prisma.league.findUniqueOrThrow({ where: { code: leagueCode } });

    await prisma.team.upsert({
      where: { id: team.id },
      update: {
        name: team.name,
        shortName: team.shortName,
        leagueId: league.id,
        attack: team.attack,
        defense: team.defense,
        elo: team.elo,
        form: team.form,
        xgFor: team.xgFor,
        xgAgainst: team.xgAgainst,
        possession: team.possession,
        pressing: team.pressing,
        tempo: team.tempo,
      },
      create: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        leagueId: league.id,
        attack: team.attack,
        defense: team.defense,
        elo: team.elo,
        form: team.form,
        xgFor: team.xgFor,
        xgAgainst: team.xgAgainst,
        possession: team.possession,
        pressing: team.pressing,
        tempo: team.tempo,
        snapshots: {
          create: {
            season: "2025/26",
            matchday: 1,
            attack: team.attack,
            defense: team.defense,
            elo: team.elo,
            form: team.form,
            xgFor: team.xgFor,
            xgAgainst: team.xgAgainst,
            possession: team.possession,
            pressing: team.pressing,
            tempo: team.tempo,
            source: "seed",
          },
        },
      },
    });
  }

  await prisma.modelVersion.upsert({
    where: { name_version: { name: "Poisson-Elo-xG", version: "1.0.0" } },
    update: { config: resolveModelConfig() as unknown as Prisma.InputJsonValue },
    create: {
      name: "Poisson-Elo-xG",
      version: "1.0.0",
      description: "Deterministisches Football Prediction Model mit Poisson, Elo, xG-Signal und Home/Away Adjustment.",
      config: resolveModelConfig() as unknown as Prisma.InputJsonValue,
    },
  });

  const epl = await prisma.league.findFirst({ where: { name: { contains: "Premier" } } });
  const sampleMatches = [
    { homeTeamId: "mci", awayTeamId: "ars", matchday: 1 },
    { homeTeamId: "rma", awayTeamId: "bar", matchday: 2 },
    { homeTeamId: "fcb", awayTeamId: "bvb", matchday: 3 },
  ];

  for (const [index, match] of sampleMatches.entries()) {
    await prisma.match.create({
      data: {
        ...match,
        leagueId: epl?.id,
        season: "2025/26",
        kickoff: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000),
        source: "seed",
        sourceId: `seed-${match.homeTeamId}-${match.awayTeamId}`,
      },
    }).catch(() => undefined);
  }

  console.log(`Database seeded with ${teams.length} teams, ${leagueNames.length} leagues, model version and sample fixtures.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
