import Link from "next/link";

export const dynamic = "force-dynamic";

export default function MethodologyPage() {
  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            Methodology
          </p>

          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">
            How our predictions work
          </h1>

          <p className="mt-5 text-slate-300">
            Our football predictions combine statistical modelling, historical
            backtesting, market calibration and match-context signals.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            View today&apos;s picks
          </Link>
        </section>

        <section className="grid gap-4">
          {[
            ["Form & Elo", "We evaluate recent team form, home/away strength, opponent strength and Elo-style ratings."],
            ["Poisson Goals Model", "Expected goal estimates are used to price Over/Under, BTTS and match outcome probabilities."],
            ["Market Edge", "Bookmaker odds are compared against our model probabilities to identify potential value."],
            ["Calibration", "Historical snapshots are evaluated to learn which markets and leagues perform best."],
            ["Risk Signals", "News, injury and squad context can reduce confidence when risk is elevated."],
          ].map(([title, body]) => (
            <article key={title} className="glass-card rounded-3xl p-6">
              <h2 className="text-2xl font-black text-cyan-300">{title}</h2>
              <p className="mt-3 text-slate-300">{body}</p>
            </article>
          ))}
        </section>

        <section className="glass-card rounded-3xl border border-yellow-400/10 bg-yellow-400/5 p-6">
          <h2 className="text-2xl font-black text-yellow-300">
            Important notice
          </h2>
          <p className="mt-3 text-slate-300">
            Predictions are probabilities, not guarantees. The platform is built
            for analysis and education. Always use responsible judgement.
          </p>
        </section>
      </div>
    </main>
  );
}
