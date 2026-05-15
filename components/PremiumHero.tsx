import Link from "next/link";

export default function PremiumHero() {
  return (
    <section className="glass-card glow relative overflow-hidden rounded-3xl p-10">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-emerald-400/10" />
      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Football Intelligence Platform
        </p>

        <h1 className="page-title mt-5 text-6xl font-black leading-tight">
          Smarter Football Decisions
        </h1>

        <p className="mt-6 max-w-2xl text-xl text-slate-300">
          Analyse Teams, Spieler, Matches und Scouting-Ziele mit einer modernen
          Football-Analytics-Plattform.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/reports-center"
            className="rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 transition hover:scale-105"
          >
            Open Reports
          </Link>

          <Link
            href="/club-house"
            className="rounded-2xl bg-white/10 px-6 py-4 font-bold text-white transition hover:bg-white/20"
          >
            Explore Clubs
          </Link>
        </div>
      </div>
    </section>
  );
}
