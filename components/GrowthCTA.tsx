import Link from "next/link";

export default function GrowthCTA() {
  return (
    <section className="rounded-[2.4rem] border border-emerald-400/10 bg-gradient-to-br from-emerald-400/10 via-cyan-400/5 to-slate-950 p-7 shadow-2xl shadow-emerald-950/20 md:p-10">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">
        Beta-Zugang
      </p>

      <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">
        Werde früher Nutzer und verfolge die Entwicklung live.
      </h2>

      <p className="mt-4 max-w-2xl text-slate-300">
        Die Plattform lernt mit jedem ausgewerteten Spiel. Frühe Mitglieder
        erhalten kostenlosen Zugang zu Picks, Dashboard, Bilanz und Spielanalysen.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-2xl bg-emerald-400 px-6 py-4 font-black text-slate-950"
        >
          Zum Dashboard
        </Link>

        <Link
          href="/methodology"
          className="rounded-2xl bg-white/10 px-6 py-4 font-black text-white"
        >
          Methode ansehen
        </Link>
      </div>
    </section>
  );
}
