import Link from "next/link";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen stadium-page px-4 pb-28 pt-6 text-white md:px-6">
        <div className="mx-auto max-w-4xl">
          <section className="glass-card glow rounded-[2rem] p-8 text-center md:p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Members Area
            </p>
            <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
              Login to view your dashboard
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-slate-300">
              Track model performance, saved insights and premium football picks.
            </p>

            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
              className="mt-8"
            >
              <button className="rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-black text-slate-950">
                Continue with Google
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const snapshots = (await prisma.$queryRawUnsafe(`
    SELECT *
    FROM "PredictionSnapshot"
    ORDER BY "createdAt" DESC
    LIMIT 200
  `).catch(() => [])) as any[];

  const evaluated = snapshots.filter((s) => s.isCorrect !== null);
  const correct = evaluated.filter((s) => s.isCorrect === true).length;
  const accuracy = evaluated.length ? (correct / evaluated.length) * 100 : 0;

  const value = evaluated.filter((s) => Number(s.edge || 0) >= 6);
  const valueCorrect = value.filter((s) => s.isCorrect === true).length;
  const valueAccuracy = value.length ? (valueCorrect / value.length) * 100 : 0;

  const premium = snapshots.filter((s) => Number(s.valueScore || 0) >= 25);

  const markets = (await prisma.$queryRawUnsafe(`
    SELECT
      "market",
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE "isCorrect" = true)::int as correct
    FROM "PredictionSnapshot"
    WHERE "isCorrect" IS NOT NULL
    GROUP BY "market"
    ORDER BY total DESC
    LIMIT 5
  `).catch(() => [])) as any[];

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Member Dashboard
          </p>

          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Welcome, {session.user.name || "Member"}
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Your personal command center for premium picks, model performance and
            prediction intelligence.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Tracked Picks" value={String(snapshots.length)} />
            <Card label="Evaluated" value={String(evaluated.length)} />
            <Card label="Accuracy" value={pct(accuracy)} />
            <Card label="Value Accuracy" value={pct(valueAccuracy)} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Today&apos;s Picks
            </Link>

            <Link
              href="/prediction-performance"
              className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white"
            >
              Full Performance
            </Link>

            <Link
              href="/news"
              className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white"
            >
              Match News
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="glass-card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Best Markets</h2>
            <p className="mt-2 text-sm text-slate-400">
              Accuracy by evaluated prediction market.
            </p>

            <div className="mt-5 space-y-3">
              {markets.map((m: any) => {
                const acc = m.total ? (Number(m.correct) / Number(m.total)) * 100 : 0;

                return (
                  <div key={m.market} className="rounded-2xl bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-cyan-300">{m.market}</p>
                      <p className="font-black text-white">{pct(acc)}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {m.correct}/{m.total} correct
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Member Status</h2>
            <p className="mt-2 text-sm text-slate-400">
              Free beta access is active.
            </p>

            <div className="mt-5 rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                Access Level
              </p>
              <p className="mt-2 text-3xl font-black text-white">Beta Member</p>
              <p className="mt-2 text-sm text-slate-300">
                Premium picks, news intelligence and performance tracking included.
              </p>
            </div>

            <div className="mt-4 rounded-3xl bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Premium Signals
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {premium.length}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                High-value model signals currently tracked.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Latest Prediction Snapshots</h2>

          <div className="mt-5 grid gap-3">
            {snapshots.slice(0, 10).map((s) => (
              <div key={s.id} className="rounded-2xl bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                      {s.market} · {s.confidence}
                    </p>
                    <p className="mt-1 font-black text-white">
                      {s.pick} · {Math.round(Number(s.probability || 0))}%
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      s.isCorrect === true
                        ? "bg-emerald-400/15 text-emerald-300"
                        : s.isCorrect === false
                        ? "bg-red-400/15 text-red-300"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {s.isCorrect === true
                      ? "Correct"
                      : s.isCorrect === false
                      ? "Wrong"
                      : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
