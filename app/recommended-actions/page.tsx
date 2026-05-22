import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RecommendedActionsPage() {
  const [
    upcoming,
    finished,
    oddsRows,
    resolved,
    correct,
  ] = await Promise.all([
    prisma.match.count({
      where: {
        kickoff: {
          gte: new Date(),
        },
      },
    }),
    prisma.match.count({
      where: {
        homeGoals: { not: null },
        awayGoals: { not: null },
      },
    }),
    prisma.bookmakerOdds.count(),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: { not: null },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: true,
      },
    }),
  ]);

  const accuracy =
    resolved > 0
      ? (correct / resolved) * 100
      : 0;

  const actions = [
    oddsRows < 3000
      ? {
          priority: "HIGH",
          title: "Odds Coverage verbessern",
          reason: "Zu wenige aktuelle Marktquoten begrenzen Verified Picks.",
        }
      : null,
    finished < 1000
      ? {
          priority: "HIGH",
          title: "Mehr historische Spiele laden",
          reason: "Mehr Historie stabilisiert ELO, xG und Calibration.",
        }
      : null,
    resolved < 1000
      ? {
          priority: "MEDIUM",
          title: "Mehr Predictions tracken",
          reason: "Calibration braucht mehr resolved Snapshots.",
        }
      : null,
    accuracy < 55
      ? {
          priority: "MEDIUM",
          title: "Pick Selector strenger kalibrieren",
          reason: "Accuracy liegt unter Zielwert.",
        }
      : null,
    upcoming < 30
      ? {
          priority: "LOW",
          title: "Fixture Coverage prüfen",
          reason: "Wenige kommende Spiele verfügbar.",
        }
      : null,
  ].filter(Boolean) as {
    priority: string;
    title: string;
    reason: string;
  }[];

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Ops
          </p>
          <h1 className="mt-3 text-5xl font-black">Recommended Actions</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Automatische nächste Schritte aus Datenlage, Odds Coverage und Modellqualität.
          </p>
        </section>

        <section className="grid gap-4">
          {actions.map((a) => (
            <div
              key={a.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <span className={
                a.priority === "HIGH"
                  ? "rounded-full bg-red-400/15 px-3 py-1 text-xs font-black text-red-300"
                  : a.priority === "MEDIUM"
                    ? "rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-black text-yellow-300"
                    : "rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300"
              }>
                {a.priority}
              </span>
              <h2 className="mt-4 text-2xl font-black">{a.title}</h2>
              <p className="mt-2 text-sm leading-7 text-neutral-400">{a.reason}</p>
            </div>
          ))}

          {actions.length === 0 ? (
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-5 text-emerald-100">
              Keine kritischen Empfehlungen. System wirkt stabil.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
