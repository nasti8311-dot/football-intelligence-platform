import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CleanMatchCard from "@/components/picks/CleanMatchCard";
import PremiumHero from "@/components/PremiumHero";
import { filterRiskControlledPicks } from "@/lib/risk-control";

export const dynamic = "force-dynamic";

export default async function DailyPicksPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

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
    take: 80,
  });

  const picks = filterRiskControlledPicks(matches).slice(0, 18);
  const safePicks = picks.filter((p: any) => p.riskLevel === "SAFE").length;
  const avgConfidence =
    picks.length > 0
      ? Math.round(
          picks.reduce((sum: number, p: any) => sum + (p.confidence || 72), 0) /
            picks.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#070707] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <PremiumHero />

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-400">
                Football IQ Daily Board
              </p>

              <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                KI-Picks mit Risiko-Kontrolle
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                Kompakte Spielkarten, Wahrscheinlichkeiten, Confidence und
                Risk-Level. Fokus auf bessere UX statt random High-Odds.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
              <Stat label="Spiele" value={matches.length} />
              <Stat label="Picks" value={picks.length} />
              <Stat label="Ø Trust" value={`${avgConfidence}%`} />
            </div>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-3">
            <InfoTile title="Risk Engine" value={`${safePicks} Safe Picks`} />
            <InfoTile title="Märkte" value="1X2 · BTTS · Over" />
            <InfoTile title="Update" value="Live Sync Ready" />
          </div>
        </section>

        {picks.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-2xl">
              ⚽
            </div>
            <p className="mt-5 text-xl font-black">Keine stabilen Picks</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-400">
              Dein Risk-Control-System hat aktuell keine Empfehlung
              freigegeben. Sobald neue Spiele und Quoten synchronisiert sind,
              erscheinen hier bessere Signale.
            </p>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {picks.map((pick: any) => (
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
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function InfoTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-white/10 px-5 py-4 sm:border-r last:border-r-0">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {title}
      </p>
      <p className="mt-1 text-sm font-bold text-neutral-200">{value}</p>
    </div>
  );
}
