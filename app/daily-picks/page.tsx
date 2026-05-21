import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CleanMatchCard from "@/components/picks/CleanMatchCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import { filterRiskControlledPicks } from "@/lib/risk-control";
import { buildTeamRatings, getTeamRating } from "@/lib/team-rating-engine";
import { buildEloRatings, getEloRating } from "@/lib/elo-engine";

export const dynamic = "force-dynamic";

export default async function DailyPicksPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const matches = await prisma.match.findMany({
    where: {
      kickoff: {
        gte: new Date(),
        lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      odds: true,
      bookmakerOdds: true,
      stats: true,
    },
    orderBy: {
      kickoff: "asc",
    },
    take: 100,
  });

  const historicalMatches = await prisma.match.findMany({
    where: {
      homeGoals: {
        not: null,
      },
      awayGoals: {
        not: null,
      },
    },
    orderBy: {
      kickoff: "desc",
    },
    take: 1200,
  });

  const teamRatings = buildTeamRatings(historicalMatches);
  const eloRatings = buildEloRatings(historicalMatches);

  const filteredPicks = filterRiskControlledPicks(matches);

  const picks =
    filteredPicks.length > 0
      ? filteredPicks.slice(0, 24)
      : matches.slice(0, 24).map((match: any) => ({
          match,
          riskLevel: "INFO",
          confidence: undefined,
        }));

  const avgConfidence =
    picks.length > 0
      ? Math.round(
          picks.reduce((sum: number, p: any) => sum + (p.confidence || 68), 0) /
            picks.length
        )
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040606] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.25),#040606_75%),url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2400&auto=format&fit=crop')] bg-cover bg-center opacity-60" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.28),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(59,130,246,0.2),transparent_30%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/45 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="relative p-5 sm:p-8">
            <div className="absolute right-6 top-6 hidden rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-300 sm:block">
              Live Intelligence
            </div>

            <div className="flex max-w-4xl flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-black text-black shadow-lg shadow-emerald-400/30">
                  IQ
                </div>

                <div>
                  <p className="text-lg font-black leading-none">
                    Football IQ
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                    Premium Match Intelligence
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-200">
                  14 Tage Vorschau · KI Wahrscheinlichkeiten · Risk Control
                </p>

                <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                  Tägliche Fußball-Picks
                  <span className="block text-emerald-300">
                    mit Stadion-Feeling.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
                  Moderne Spielanalyse mit 1X2, BTTS, Über/Unter-Toren,
                  Confidence, Teamlogos und smarter Risiko-Kontrolle.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <HeroStat label="Spiele" value={matches.length} />
                <HeroStat label="Cards" value={picks.length} />
                <HeroStat label="Ø Trust" value={`${avgConfidence}%`} />
                <HeroStat label="Zeitraum" value="14 Tage" />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Feature title="Probability Engine" text="Poisson-Modell + Quoten-Normalisierung für realistischere Prozentwerte." />
          <Feature title="Risk Control" text="Filtert aggressive Random-Picks und priorisiert stabile Empfehlungen." />
          <Feature title="Premium Board" text="Mobile-first Cards mit Stadionlook, Ringen und klaren Tipps." />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-400">
                Match Board
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">
                Beste Spiele & KI-Signale
              </h2>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-bold text-neutral-300 backdrop-blur sm:block">
              {picks.length} aktive Cards
            </div>
          </div>

          {picks.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-black/45 p-10 text-center backdrop-blur-xl">
              <p className="text-xl font-black">Noch keine Spiele gefunden</p>
              <p className="mt-2 text-sm text-neutral-400">
                Sync starten oder Datenquellen prüfen.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {picks.map((pick: any) => (
                <CleanMatchCard
                  key={pick.match.id}
                  p={pick}
                  ratings={{
                    home: getTeamRating(teamRatings, pick.match.homeTeamId),
                    away: getTeamRating(teamRatings, pick.match.awayTeamId),
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <MobileBottomNav />
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/45 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-400">{text}</p>
    </div>
  );
}
