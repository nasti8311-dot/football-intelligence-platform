const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const league = await prisma.league.upsert({
    where: { code: "D1" },
    update: {},
    create: { code: "D1", name: "Bundesliga", country: "Germany" },
  });

  const bayern = await prisma.team.upsert({
    where: { name: "Bayern Munich" },
    update: {},
    create: { name: "Bayern Munich", leagueId: league.id },
  });

  const leipzig = await prisma.team.upsert({
    where: { name: "RB Leipzig" },
    update: {},
    create: { name: "RB Leipzig", leagueId: league.id },
  });

  await prisma.match.create({
    data: {
      sourceId: "test-bayern-leipzig-1",
      leagueId: league.id,
      homeTeamId: bayern.id,
      awayTeamId: leipzig.id,
      kickoff: new Date("2025-08-22T19:30:00Z"),
      homeGoals: 6,
      awayGoals: 0,
      status: "FINISHED",
    },
  });

  console.log("Seed done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
