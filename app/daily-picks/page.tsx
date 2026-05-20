import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CleanMatchCard from "@/components/picks/CleanMatchCard";
import PremiumHero from "@/components/PremiumHero";
import { filterRiskControlledPicks } from "@/lib/risk-control";

export const dynamic = "force-dynamic";

export default async function DailyPicksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: new Date(),
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      odds: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 40,
  });

  const picks = filterRiskControlledPicks(matches).slice(0, 12);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <PremiumHero />

        <section className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              Tägliche KI-Picks
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Beste Spiele heute
            </h1>
          </div>

          {picks.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-neutral-300">
              Aktuell sind keine stabilen Picks verfügbar.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {picks.map((pick) => (
                <CleanMatchCard key={pick.match.id} p={pick} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
