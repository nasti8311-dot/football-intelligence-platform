import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BetaDashboardPage() {
  const now = new Date();
  const in3Days = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);

  const [matches, picks, resolved, correct, oddsRows] = await Promise.all([
    prisma.match.count({
      where: {
        kickoff: {
          gte: now,
          lte: in3Days,
        },
      },
    }),
    prisma.predictionSnapshot.count({
      where: {
        isCorrect: null,
        match: {
          kickoff: {
            gte: now,
            lte: in3Days,
          },
        },
      },
    }),
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
    prisma.bookmakerOdds.count(),
  ]);

  const accuracy =
    resolved > 0
      ? Number(((correct / resolved) * 100).toFixed(1))
      : 0;

  const betaReady = resolved >= 300 && oddsRows >= 1000;

  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Beta Control
          </p>
          <h1 className="mt-3 text-5xl font-black">Beta Dashboard</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Öffentliche Beta-Kontrolle für Datenstand, Predictions und Modellstatus.
          </p>

          <div className="mt-6">
            <span className={
              betaReady
                ? "rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-300"
                : "rounded-full bg-yellow-400/15 px-4 py-2 text-xs font-black text-yellow-300"
            }>
              {betaReady ? "BETA READY" : "BUILDING"}
            </span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-5">
          <Card label="3D Matches" value={matches} />
          <Card label="Open Picks" value={picks} />
          <Card label="Resolved" value={resolved} />
          <Card label="Accuracy" value={`${accuracy}%`} />
          <Card label="Odds Rows" value={oddsRows} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Nav href="/verified-picks" title="Verified Picks" />
          <Nav href="/model-quality" title="Model Quality" />
          <Nav href="/data-gaps" title="Data Gaps" />
          <Nav href="/match-center" title="Match Center" />
          <Nav href="/public-track-record" title="Track Record" />
          <Nav href="/ops-center" title="Ops Center" />
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function Nav({ href, title }: { href: string; title: string }) {
  return (
    <Link href={href} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 font-black transition hover:border-emerald-400/40">
      {title}
    </Link>
  );
}
