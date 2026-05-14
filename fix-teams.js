const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const teams = ["Bayern", "Dortmund", "Leverkusen", "Liverpool", "Arsenal", "City"];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const events = await prisma.event.findMany();

  console.log("Checking", events.length, "events");

  let fixed = 0;

  for (const e of events) {
    if (!e.team || e.team === "undefined" || e.team === "") {
      await prisma.event.update({
        where: { id: e.id },
        data: {
          team: teams[rand(0, teams.length - 1)],
        },
      });
      fixed++;
    }
  }

  console.log("Fixed", fixed, "events");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
