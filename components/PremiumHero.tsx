import Link from "next/link";
import TrustStrip from "@/components/TrustStrip";

export default function PremiumHero() {
  return (
    <section className="relative overflow-hidden rounded-[2.4rem] border border-cyan-400/10 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-950/30 md:p-10">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative grid gap-8 md:grid-cols-[1.3fr_0.7fr] md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-300">
            Football Intelligence Beta
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-7xl">
            Premium Fußball-Prognosen mit echter Modell-Logik.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Wir kombinieren Form, Elo, Torerwartung, Quoten, News-Signale,
            Backtesting und Kalibrierung zu klaren Picks für die nächsten Spiele.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 shadow-lg shadow-cyan-400/20"
            >
              Picks ansehen
            </Link>

            <Link
              href="/methodology"
              className="rounded-2xl bg-white/10 px-6 py-4 font-black text-white hover:bg-white/15"
            >
              Methode verstehen
            </Link>

            <Link
              href="/prediction-performance"
              className="rounded-2xl bg-white/10 px-6 py-4 font-black text-white hover:bg-white/15"
            >
              Bilanz prüfen
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Modell-Fokus
          </p>

          <div className="mt-4 space-y-3">
            {[
              ["Marktwert", "Quoten vs. Modellwahrscheinlichkeit"],
              ["Kalibrierung", "Ligen und Märkte nach Performance"],
              ["Risiko", "News, Verletzungen und Datenqualität"],
              ["Transparenz", "Trefferquote und Snapshot-Bilanz"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl bg-white/[0.045] p-4">
                <p className="font-black text-cyan-300">{a}</p>
                <p className="mt-1 text-sm text-slate-400">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-8">
        <TrustStrip />
      </div>
    </section>
  );
}
