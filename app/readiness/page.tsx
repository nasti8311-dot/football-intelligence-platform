import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReadinessPage() {
  const [
    matches,
    upcoming,
    finished,
    odds,
    snapshots,
    resolved,
    correct,
  ] = await Promise.all([
    prisma.match.count(),
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
    prisma.predictionSnapshot.count(),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: {
          not: null,
        },
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
      ? Number(((correct / resolved) * 100).toFixed(1))
      : 0;

  const score = Math.min(
    100,
    Math.round(
      (finished >= 1000 ? 25 : (finished / 1000) * 25) +
        (odds >= 3000 ? 20 : (odds / 3000) * 20) +
        (resolved >= 1000 ? 25 : (resolved / 1000) * 25) +
        (upcoming >= 30 ? 15 : (upcoming / 30) * 15) +
        (accuracy >= 55 ? 15 : 5)
    )
  );

  const status =
    score >= 80
      ? "PUBLIC READY"
      : score >= 60
        ? "BETA READY"
        : "BUILDING";

  const actions = [
    {
      label: "Mehr historische Spiele",
      done: finished >= 1000,
      current: finished,
      target: 1000,
    },
    {
      label: "Mehr Odds Coverage",
      done: odds >= 3000,
      current: odds,
      target: 3000,
    },
    {
      label: "Mehr resolved Predictions",
      done: resolved >= 1000,
      current: resolved,
      target: 1000,
    },
    {
      label: "Upcoming Fixtures",
      done: upcoming >= 30,
      current: upcoming,
      target: 30,
    },
  ];

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Launch Control
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Model Readiness
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Launch-Status basierend auf Datenmenge, Odds Coverage, resolved Predictions
            und aktueller Modell-Accuracy.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/quant-hub" className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
              Quant Hub
            </Link>
            <Link href="/model-quality" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white">
              Modellqualität
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card label="Readiness" value={`${score}%`} />
          <Card label="Status" value={status} />
          <Card label="Resolved" value={resolved} />
          <Card label="Accuracy" value={`${accuracy}%`} />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
            Launch Checkliste
          </p>

          <div className="mt-5 grid gap-3">
            {actions.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <div>
                  <p className="font-black">{item.label}</p>
                  <p className="text-xs text-neutral-500">
                    {item.current} / {item.target}
                  </p>
                </div>

                <span
                  className={
                    item.done
                      ? "rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300"
                      : "rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-black text-yellow-300"
                  }
                >
                  {item.done ? "OK" : "OFFEN"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}
