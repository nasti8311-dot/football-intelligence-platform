import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
            Wichtiger Hinweis
          </p>

          <h1 className="mt-4 text-5xl font-black">
            Keine Gewinn-Garantie.
          </h1>

          <p className="mt-6 text-base leading-8 text-neutral-400">
            Football IQ zeigt datenbasierte Fußballprognosen. Die Inhalte sind keine
            Wettberatung, keine Finanzberatung und keine Garantie für Gewinne.
          </p>

          <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 text-sm leading-7 text-yellow-100">
            Fußball bleibt unsicher. Auch gute Prognosen können verlieren.
          </div>

          <Link href="/daily-picks" className="mt-8 inline-flex rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
            Zurück zu Daily Picks
          </Link>
        </section>
      </div>
    </main>
  );
}
