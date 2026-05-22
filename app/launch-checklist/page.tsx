import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LaunchChecklistPage() {
  const [
    finished,
    oddsRows,
    snapshots,
    resolved,
    correct,
    upcoming,
  ] = await Promise.all([
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
        isCorrect: { not: null },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: true,
      },
    }),
    prisma.match.count({
      where: {
        kickoff: { gte: new Date() },
      },
    }),
  ]);

  const accuracy =
    resolved > 0
      ? (correct / resolved) * 100
      : 0;

  const checks = [
    {
      label: "Historische Daten",
      current: finished,
      target: 1000,
      passed: finished >= 1000,
    },
    {
      label: "Odds Daten",
      current: oddsRows,
      target: 3000,
      passed: oddsRows >= 3000,
    },
    {
      label: "Prediction Tracking",
      current: snapshots,
      target: 500,
      passed: snapshots >= 500,
    },
    {
      label: "Resolved Predictions",
      current: resolved,
      target: 500,
      passed: resolved >= 500,
    },
    {
      label: "Model Accuracy",
      current: Number(accuracy.toFixed(1)),
      target: 55,
      passed: accuracy >= 55,
    },
    {
      label: "Upcoming Fixtures",
      current: upcoming,
      target: 30,
      passed: upcoming >= 30,
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Launch Control
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Launch Checklist
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
            Öffentliche Beta-Bereitschaft basierend auf Daten, Odds, Tracking,
            resolved Predictions und Modellqualität.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card label="Launch Score" value={`${score}%`} />
          <Card label="Checks Passed" value={`${passed}/${checks.length}`} />
          <Card
            label="Status"
            value={passed >= 4 ? "Beta Ready" : "Building"}
          />
        </section>

        <section className="grid gap-4">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div>
                <p className="text-lg font-black">{check.label}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {check.current} / {check.target}
                </p>
              </div>

              <span
                className={
                  check.passed
                    ? "rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-300"
                    : "rounded-full bg-yellow-400/15 px-4 py-2 text-xs font-black text-yellow-300"
                }
              >
                {check.passed ? "OK" : "OFFEN"}
              </span>
            </div>
          ))}
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
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
