import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  const now = new Date();

  const [
    matches,
    upcoming,
    finished,
    odds,
    snapshots,
    resolved,
    correct,
    verifiedUpcoming,
  ] = await Promise.all([
    prisma.match.count(),

    prisma.match.count({
      where: {
        kickoff: {
          gte: now,
        },
      },
    }),

    prisma.match.count({
      where: {
        homeGoals: {
          not: null,
        },
        awayGoals: {
          not: null,
        },
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

    prisma.predictionSnapshot.count({
      where: {
        isCorrect: null,
        edge: {
          gt: 0.04,
        },
      },
    }),
  ]);

  return {
    matches,
    upcoming,
    finished,
    odds,
    snapshots,
    resolved,
    correct,
    verifiedUpcoming,
    accuracy:
      resolved > 0
        ? ((correct / resolved) * 100).toFixed(1)
        : "0",
  };
}

export default async function StatusPage() {
  const stats = await getStats();

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Live Status
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Platform Status
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
            Live Überblick über Datenlage, Modellaktivität und Prediction-System.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <Card label="Matches" value={stats.matches} />
          <Card label="Upcoming" value={stats.upcoming} />
          <Card label="Odds Rows" value={stats.odds} />
          <Card label="Accuracy" value={`${stats.accuracy}%`} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatusBox
            title="Prediction Engine"
            status="ONLINE"
            desc={`${stats.snapshots} snapshots gespeichert`}
          />

          <StatusBox
            title="Verification Layer"
            status="ONLINE"
            desc={`${stats.verifiedUpcoming} verified upcoming picks`}
          />

          <StatusBox
            title="Historical Resolver"
            status="ONLINE"
            desc={`${stats.resolved} resolved predictions`}
          />

          <StatusBox
            title="Odds Integration"
            status={stats.odds > 0 ? "ONLINE" : "LIMITED"}
            desc={`${stats.odds} bookmaker odds rows`}
          />

          <StatusBox
            title="Calibration Engine"
            status={stats.resolved > 100 ? "ONLINE" : "LEARNING"}
            desc={`${stats.correct} correct resolved picks`}
          />

          <StatusBox
            title="xG Engine"
            status="ONLINE"
            desc="Expected goals modelling active"
          />
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

      <p className="mt-2 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}

function StatusBox({
  title,
  status,
  desc,
}: {
  title: string;
  status: string;
  desc: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">
          {title}
        </h2>

        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
          {status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-7 text-neutral-400">
        {desc}
      </p>
    </div>
  );
}
