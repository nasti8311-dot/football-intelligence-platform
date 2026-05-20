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
    take: 60,
  });

  const picks = filterRiskControlledPicks(matches).slice(0, 12);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <PremiumHero />

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                Daily Intelligence
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                Beste KI-Picks heute
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Risiko-gefilterte Fußball-Picks mit Fokus auf stabile Märkte,
                Value und Trust.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[320px]">
              <Stat label="Spiele" value={matches.length} />
              <Stat label="Picks" value={picks.length} />
              <Stat label="Modus" value="SAFE" />
            </div>
          </div>
        </section>

        {picks.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-lg font-bold">Keine stabilen Picks gefunden</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-400">
              Es gibt aktuell Spiele, aber dein Risk-Control-System hat keine
              ausreichend stabilen Empfehlungen freigegeben.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {picks.map((pick) => (
              <CleanMatchCard key={pick.match.id} p={pick} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
