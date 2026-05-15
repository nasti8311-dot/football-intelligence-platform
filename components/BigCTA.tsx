import Link from "next/link";

export default function BigCTA() {
  return (
    <section className="glass-card glow relative overflow-hidden rounded-3xl p-10">
      <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Football Intelligence
        </p>

        <h2 className="page-title mt-4 text-5xl font-black">
          Ready for Elite Analytics?
        </h2>

        <p className="mt-5 text-lg text-slate-300">
          Analyse Teams, Spieler, Gegner und Matches mit modernen AI-gestützten Football-Tools.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/reports-center"
            className="rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 transition hover:scale-105"
          >
            Open Reports
          </Link>

          <Link
            href="/scout-dashboard"
            className="rounded-2xl bg-white/10 px-6 py-4 font-bold text-white transition hover:bg-white/20"
          >
            Open Scouting
          </Link>
        </div>
      </div>
    </section>
  );
}
