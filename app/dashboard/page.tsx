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

  const evaluated = snapshots.filter((s) => s.isRichtig !== null);
  const correct = evaluated.filter((s) => s.isRichtig === true).length;
  const accuracy = evaluated.length ? (correct / evaluated.length) * 100 : 0;

  const value = evaluated.filter((s) => Number(s.edge || 0) >= 6);
  const valueRichtig = value.filter((s) => s.isRichtig === true).length;
  const valueTrefferquote = value.length ? (valueRichtig / value.length) * 100 : 0;

  const premium = snapshots.filter((s) => Number(s.valueScore || 0) >= 25);

  const savedPicks = (await prisma.$queryRawUnsafe(
    `SELECT * FROM "SavedPick"
     WHERE "email" = $1
     ORDER BY "createdAt" DESC
     LIMIT 20`,
    session.user.email
  ).catch(() => [])) as any[];

  const markets = (await prisma.$queryRawUnsafe(`
    SELECT
      "market",
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE "isRichtig" = true)::int as correct
    FROM "PredictionSnapshot"
    WHERE "isRichtig" IS NOT NULL
    GROUP BY "market"
    ORDER BY total DESC
    LIMIT 5
  `).catch(() => [])) as any[];

  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Mitglieder-Dashboard
          </p>

          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            Willkommen, {session.user.name || "Member"}
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Deine persönliche Übersicht für Premium-Picks, Modell-Performance und Prognose-Intelligence.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Getrackte Picks" value={String(snapshots.length)} />
            <Card label="Ausgewertet" value={String(evaluated.length)} />
            <Card label="Trefferquote" value={pct(accuracy)} />
            <Card label="Value Trefferquote" value={pct(valueTrefferquote)} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Heutige Picks
            </Link>

            <Link
              href="/prediction-performance"
              className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white"
            >
              Gesamte Bilanz
            </Link>

            <Link
              href="/news"
              className="rounded-2xl bg-white/10 px-5 py-3 font-bold text-white"
            >
              Spiel-News
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="glass-card rounded-[2rem] p-6">
            <h2 className="text-2xl font-black">Beste Märkte</h2>
            <p className="mt-2 text-sm text-slate-400">
              Trefferquote by evaluated prediction market.
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
            <h2 className="text-2xl font-black">Mitgliedsstatus</h2>
            <p className="mt-2 text-sm text-slate-400">
              Kostenloser Beta-Zugang ist aktiv.
            </p>

            <div className="mt-5 rounded-3xl border border-emerald-400/10 bg-emerald-400/5 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                Zugriffslevel
              </p>
              <p className="mt-2 text-3xl font-black text-white">Beta-Mitglied</p>
              <p className="mt-2 text-sm text-slate-300">
                Premium-Picks, News-Auswertung und Performance-Tracking inklusive.
              </p>
            </div>

            <div className="mt-4 rounded-3xl bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Premium-Signale
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {premium.length}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Aktuell getrackte hochwertige Modell-Signale.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Gespeicherte Picks</h2>

          <div className="mt-5 grid gap-3">
            {savedPicks.length === 0 ? (
              <p className="text-sm text-slate-400">
                Noch keine gespeicherten Picks. Speichere Picks auf der Tagespicks-Seite.
              </p>
            ) : (
              savedPicks.map((s: any) => (
                <a
                  key={s.id}
                  href={`/matches/${s.matchId}`}
                  className="rounded-2xl bg-slate-950/60 p-4 hover:bg-slate-900"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    {s.market}
                  </p>
                  <p className="mt-1 font-black text-white">
                    {s.pick} · {Math.round(Number(s.probability || 0))}%
                  </p>
                </a>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6">
          <h2 className="text-2xl font-black">Neueste Prognose-Snapshots</h2>

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
                      s.isRichtig === true
                        ? "bg-emerald-400/15 text-emerald-300"
                        : s.isRichtig === false
                        ? "bg-red-400/15 text-red-300"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {s.isRichtig === true
                      ? "Richtig"
                      : s.isRichtig === false
                      ? "Falsch"
                      : "Offen"}
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
