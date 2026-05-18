import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen stadium-page px-4 pb-28 pt-4 text-white md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="glass-card glow rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Terms</p>
          <h1 className="page-title mt-4 text-4xl font-black md:text-6xl">Terms of Use</h1>
          <p className="mt-5 text-slate-300">
            This platform provides football prediction analytics for informational and educational purposes only.
          </p>
          <Link href="/" className="mt-6 inline-block rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
            Back to predictions
          </Link>
        </section>

        <section className="glass-card rounded-3xl p-6 text-slate-300">
          <h2 className="text-2xl font-black text-cyan-300">No guarantees</h2>
          <p className="mt-3">
            Predictions are probability-based estimates, not guaranteed outcomes. Football results are uncertain.
          </p>

          <h2 className="mt-8 text-2xl font-black text-cyan-300">Responsible use</h2>
          <p className="mt-3">
            Use this website responsibly. Do not rely on predictions as financial advice.
          </p>

          <h2 className="mt-8 text-2xl font-black text-cyan-300">Data</h2>
          <p className="mt-3">
            Match data, odds and news may be delayed, incomplete or unavailable depending on third-party sources.
          </p>
        </section>
      </div>
    </main>
  );
}
