const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const eventTypes = ["pass", "shot", "carry", "dribble", "cross", "tackle"];
const teams = ["Bayern", "Dortmund", "Leverkusen", "Arsenal", "Liverpool", "City"];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const events = await prisma.event.findMany({ take: 5000 });

  for (const e of events) {
    const type = eventTypes[rand(0, eventTypes.length - 1)];

    await prisma.event.update({
      where: { id: e.id },
      data: {
        team: !e.team || e.team === "undefined" ? teams[rand(0, teams.length - 1)] : e.team,
        eventType: type,
        outcome: "successful",
      },
    });
  }

  console.log("Events enriched:", events.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
