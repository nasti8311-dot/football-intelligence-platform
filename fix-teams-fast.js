const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const teams = ["Bayern", "Dortmund", "Leverkusen", "Liverpool", "Arsenal", "City"];

async function main() {
  let total = 0;

  for (const team of teams) {
    const result = await prisma.event.updateMany({
      where: {
        OR: [
          { team: null },
          { team: "undefined" },
          { team: "" }
        ]
      },
      data: { team }
    });

    total += result.count;
    console.log(team, result.count);
  }

  console.log("Fixed total:", total);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
