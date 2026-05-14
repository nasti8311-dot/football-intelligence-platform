const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const players = ["Saka", "Rice", "Odegaard", "Salah", "Trent", "Kane", "Musiala"];

function rand(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

async function main() {
  const events = await prisma.event.findMany({ take: 20000 });

  for (const e of events) {
    const eventType = e.eventType || "pass";
    const x = e.x ?? rand(5, 95);
    const y = e.y ?? rand(5, 95);

    await prisma.event.update({
      where: { id: e.id },
      data: {
        player: e.player || players[rand(0, players.length - 1)],
        x,
        y,
        endX: e.endX ?? rand(5, 95),
        endY: e.endY ?? rand(5, 95),
        xg: e.xg ?? (eventType === "shot" ? Math.random() * 0.5 : 0),
      },
    });
  }

  console.log("Events enriched:", events.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
