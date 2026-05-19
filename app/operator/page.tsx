import Link from "next/link";
import { auth, signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function pct(v: number) {
  return `${Math.round(v)}%`;
}

export default async function OperatorPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen stadium-page px-4 pb-28 pt-6 text-white md:px-6">
        <div className="mx-auto max-w-4xl">
          <section className="glass-card glow rounded-[2rem] p-8 text-center md:p-12">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
              Operator
            </p>
            <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
              Einloggen erforderlich
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-slate-300">
              Melde dich an, um den Plattform-Status zu sehen.
            </p>

            <form
              action={async () => {
                "use server";
                await signIn("google");
              }}
              className="mt-8"
            >
              <button className="rounded-2xl bg-cyan-400 px-8 py-4 text-lg font-black text-slate-950">
                Mit Google fortfahren
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const matchesToday = await prisma.match.count({
    where: {
      kickoff: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const upcoming = await prisma.match.count({
    where: {
      kickoff: {
        gte: new Date(),
      },
    },
  });

  const snapshots = (await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE "isCorrect" IS NOT NULL)::int as evaluated,
      COUNT(*) FILTER (WHERE "isCorrect" = true)::int as correct,
      COUNT(*) FILTER (WHERE "isCorrect" IS NULL)::int as pending
    FROM "PredictionSnapshot"
  `).catch(() => [{ total: 0, evaluated: 0, correct: 0, pending: 0 }])) as any[];

  const news = (await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int as total FROM "MatchNews"
  `).catch(() => [{ total: 0 }])) as any[];

  const activities = (await prisma.$queryRawUnsafe(`
    SELECT
      COUNT(*)::int as events,
      COUNT(DISTINCT email)::int as users
    FROM "UserActivity"
  `).catch(() => [{ events: 0, users: 0 }])) as any[];

  const recentActivity = (await prisma.$queryRawUnsafe(`
    SELECT email, name, path, event, "createdAt"
    FROM "UserActivity"
    ORDER BY "createdAt" DESC
    LIMIT 10
  `).catch(() => [])) as any[];

  const evaluated = Number(snapshots[0]?.evaluated || 0);
  const correct = Number(snapshots[0]?.correct || 0);
  const accuracy = evaluated ? (correct / evaluated) * 100 : 0;

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Operator Center
          </p>

          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Plattform-Status
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Interne Übersicht für Datenqualität, Nutzeraktivität, Picks, News und Modell-Performance.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Spiele heute" value={String(matchesToday)} />
            <Card label="Kommende Spiele" value={String(upcoming)} />
            <Card label="Nutzer" value={String(activities[0]?.users || 0)} />
            <Card label="Events" value={String(activities[0]?.events || 0)} />
            <Card label="Snapshots" value={String(snapshots[0]?.total || 0)} />
            <Card label="Offen" value={String(snapshots[0]?.pending || 0)} />
            <Card label="Trefferquote" value={pct(accuracy)} />
            <Card label="News" value={String(news[0]?.total || 0)} />
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Schnellaktionen</h2>
          <p className="mt-2 text-sm text-slate-400">
            Starte die wichtigsten Systemjobs direkt aus dem Browser.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Action href="/api/cron/sync-fixtures" label="Spiele syncen" />
            <Action href="/api/cron/sync-odds" label="Quoten syncen" />
            <Action href="/api/cron/sync-odds-events" label="Odds Events syncen" />
            <Action href="/api/cron/sync-news" label="News syncen" />
            <Action href="/api/cron/daily-refresh" label="Daily Refresh" />
            <Action href="/api/debug/fixture-coverage" label="Fixture Coverage" />
            <Action href="/api/cron/sync-results" label="Ergebnisse syncen" />
            <Action href="/api/cron/evaluate-predictions" label="Picks auswerten" />
            <Action href="/api/cron/calibrate-model" label="Märkte kalibrieren" />
            <Action href="/api/cron/calibrate-leagues" label="Ligen kalibrieren" />
            <Action href="/api/cron/historical-backfill?code=DED" label="Eredivisie Backfill" />
            <Action href="/api/cron/historical-backfill?code=PPL" label="Portugal Backfill" />
            <Action href="/api/cron/historical-backfill?code=CL" label="Champions League Backfill" />
            <Action href="/api/cron/historical-backfill?code=EL" label="Europa League Backfill" />
            <Action href="/api/cron/historical-backfill?code=ECL" label="Conference League Backfill" />
            <Action href="/api/cron/historical-backfill?code=ELC" label="Championship Backfill" />
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Letzte Nutzeraktivität</h2>

          <div className="mt-5 grid gap-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400">
                Noch keine Nutzeraktivität gespeichert.
              </p>
            ) : (
              recentActivity.map((a: any, index: number) => (
                <div key={index} className="rounded-2xl bg-slate-950/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{a.name || a.email}</p>
                      <p className="text-xs text-slate-500">{a.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-cyan-300">{a.path || "/"}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(a.createdAt).toLocaleString("de-DE")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-[2rem] border border-yellow-400/10 bg-yellow-400/5 p-6">
          <h2 className="text-2xl font-black text-yellow-300">Hinweis</h2>
          <p className="mt-3 text-sm text-slate-300">
            Diese Seite ist intern gedacht. Später sollten wir sie auf deine Admin-E-Mail beschränken.
          </p>
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-950/60 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  );
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white/10 px-5 py-4 text-center text-sm font-black text-white hover:bg-white/15"
    >
      {label}
    </Link>
  );
}
