const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const teams = [
  "Arsenal",
  "Bayern",
  "City",
  "Dortmund",
  "Leverkusen",
  "Liverpool"
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const events = await prisma.event.findMany();

  let fixed = 0;

  for (const e of events) {
    if (e.team === "undefined") {
      await prisma.event.update({
        where: { id: e.id },
        data: {
          team: teams[rand(0, teams.length - 1)]
        }
      });

      fixed++;
    }
  }

  console.log("Fixed:", fixed);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
