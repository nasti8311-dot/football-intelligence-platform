const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const matches = await prisma.match.findMany({
    take: 500,
  });

  console.log("Matches:", matches.length);

  for (const match of matches) {
    const events = await prisma.event.findMany({
      where: {
        matchId: match.id
      }
    });

    for (const e of events) {
      await prisma.event.update({
        where: { id: e.id },
        data: {
          team: rand([match.homeTeamId, match.awayTeamId])
        }
      });
    }
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
