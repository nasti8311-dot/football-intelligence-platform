import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SystemStatusPage() {
  const matches = await prisma.match.count();
  const upcoming = await prisma.match.count({
    where: { kickoff: { gt: new Date() } },
  });

  const odds = (await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS count FROM "BookmakerOdds"
  `).catch(() => [{ count: 0 }])) as any[];

  const news = (await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS count FROM "MatchNews"
  `).catch(() => [{ count: 0 }])) as any[];

  const snapshots = (await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int AS count FROM "PredictionSnapshot"
  `).catch(() => [{ count: 0 }])) as any[];

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            System Status
          </p>
          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Data Health
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Übersicht über Fixtures, Odds, News und gespeicherte Prediction-Snapshots.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card label="Matches" value={matches} />
          <Card label="Upcoming" value={upcoming} />
          <Card label="Odds" value={odds[0]?.count ?? 0} />
          <Card label="News" value={news[0]?.count ?? 0} />
          <Card label="Snapshots" value={snapshots[0]?.count ?? 0} />
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Manual Refresh</h2>
          <p className="mt-2 text-slate-300">
            Starte den kompletten täglichen Datenlauf manuell.
          </p>

          <Link
            href="/api/cron/daily-refresh"
            className="mt-5 inline-block rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950"
          >
            Run Daily Refresh
          </Link>
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card rounded-3xl p-5 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
