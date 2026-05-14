const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const playerPools = {
  "bayern-munich": ["Kane", "Musiala", "Kimmich", "Olise", "Davies"],
  "dortmund": ["Brandt", "Adeyemi", "Schlotterbeck", "Sabitzer", "Ryerson"],
  "leverkusen": ["Wirtz", "Grimaldo", "Schick", "Tah", "Frimpong"],
  "arsenal": ["Saka", "Rice", "Odegaard", "Martinelli", "Saliba"],
  "liverpool": ["Salah", "Trent", "Mac Allister", "Van Dijk", "Diaz"],
  "city": ["Haaland", "Foden", "Rodri", "De Bruyne", "Doku"],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const events = await prisma.event.findMany({ take: 20000 });

  let updated = 0;

  for (const e of events) {
    const pool = playerPools[e.team] || ["Player A", "Player B", "Player C", "Player D"];
    await prisma.event.update({
      where: { id: e.id },
      data: {
        player: e.player || pick(pool),
      },
    });
    updated++;
  }

  console.log("Players assigned:", updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
