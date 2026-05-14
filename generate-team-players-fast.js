const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const names = [
  "Luca Meyer", "Noah Schmidt", "Elias Costa", "Jonas Silva", "Milan Marin",
  "Leo Olsen", "Nico Santos", "Max Rossi", "Emil Fernandez", "David Berg",
  "Adam Weber", "Oscar Klein", "Luis Hansen", "Ben Moretti", "Felix Ramos",
  "Theo Wagner", "Rafael Larsen", "Daniel Novak", "Marco Fischer", "Ivan Mendes"
];

const positions = ["GK", "CB", "RB", "LB", "DM", "CM", "AM", "RW", "LW", "ST"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const events = await prisma.event.findMany({
    take: 20000,
    select: { id: true, team: true },
  });

  console.log("Events:", events.length);

  let count = 0;

  for (const e of events) {
    const player = `${pick(names)} (${pick(positions)})`;

    await prisma.event.update({
      where: { id: e.id },
      data: { player },
    });

    count++;

    if (count % 500 === 0) {
      console.log("Updated", count);
    }
  }

  console.log("Done:", count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
