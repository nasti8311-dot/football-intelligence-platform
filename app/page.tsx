import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    resolved,
    correct,
    oddsRows,
  ] = await Promise.all([
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

  return (
    <main className="min-h-screen bg-[#050707] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36">
          <div className="max-w-4xl">
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
              Täglich aktualisierte Fußballprognosen
            </div>

            <h1 className="mt-6 text-6xl font-black leading-none tracking-tight md:text-8xl">
              Datenbasierte
              <br />
              Fußballprognosen.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-400">
              Football IQ veröffentlicht täglich ausgewählte Spiele auf Basis von
              Daten, Quoten und Modellwahrscheinlichkeiten.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/daily-picks"
                className="rounded-2xl bg-emerald-400 px-7 py-4 text-sm font-black text-black transition hover:scale-[1.02]"
              >
                Daily Picks ansehen
              </Link>

              <Link
                href="/public-track-record"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-black text-white transition hover:border-emerald-400/40"
              >
                Performance prüfen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 md:grid-cols-3 md:px-8">
        <Card
          label="Historische Trefferquote"
          value={`${accuracy}%`}
        />

        <Card
          label="Ausgewertete Prognosen"
          value={resolved}
        />

        <Card
          label="Gespeicherte Quoten"
          value={oddsRows}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-black p-8 md:p-12">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Warum Football IQ?
          </p>

          <h2 className="mt-4 text-4xl font-black">
            Weniger Picks.
            Bessere Qualität.
          </h2>

          <p className="mt-6 max-w-3xl text-base leading-8 text-neutral-400">
            Unser Fokus liegt nicht auf Masse, sondern auf wenigen hochwertigen
            Daily Picks mit nachvollziehbarer Performance.
          </p>
        </div>
      </section>
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
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-xl shadow-black/20">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-500">
        {label}
      </p>

      <p className="mt-4 text-5xl font-black text-white">
        {value}
      </p>
    </div>
  );
}
