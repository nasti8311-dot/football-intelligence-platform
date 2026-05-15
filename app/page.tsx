import Link from "next/link";

export default function HomePage() {
  const cards = [
    {
      title: "Team Analysis",
      href: "/team-intelligence",
      desc: "Teamstärke, Form, Tore, Tabellen und taktische Profile.",
    },
    {
      title: "Player Scouting",
      href: "/ai-scout-report",
      desc: "AI-basierte Spielerbewertungen und Scout Reports.",
    },
    {
      title: "Match Predictions",
      href: "/prediction-center",
      desc: "Wahrscheinlichkeiten, Matchmodelle und Confidence Scores.",
    },
    {
      title: "Event Intelligence",
      href: "/event-intelligence",
      desc: "Heatmaps, Eventdaten und Aktionen auf dem Spielfeld.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Football Intelligence Platform
          </p>

          <h1 className="mt-5 max-w-4xl text-6xl font-black leading-tight">
            Modern Football Analytics
            <span className="text-cyan-400"> powered by AI</span>
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-slate-300">
            Analyse Teams, Spieler und Spiele mit intelligenter
            Football-Datenanalyse.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/team-intelligence"
              className="rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 transition hover:scale-105"
            >
              Open Platform
            </Link>

            <Link
              href="/ai-scout-report"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-bold transition hover:bg-white/10"
            >
              Scout Reports
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12">
          <p className="text-sm text-cyan-400">Platform Modules</p>
          <h2 className="mt-2 text-4xl font-bold">
            Everything in one analytics system
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:scale-[1.02] hover:border-cyan-400/40"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                ⚽
              </div>

              <h3 className="text-2xl font-bold group-hover:text-cyan-300">
                {card.title}
              </h3>

              <p className="mt-4 text-slate-400">
                {card.desc}
              </p>

              <div className="mt-6 text-sm font-semibold text-cyan-300">
                Open →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
          <div className="rounded-3xl bg-white/[0.04] p-8">
            <p className="text-5xl font-black text-cyan-300">20k+</p>
            <p className="mt-3 text-slate-400">Tracked Events</p>
          </div>

          <div className="rounded-3xl bg-white/[0.04] p-8">
            <p className="text-5xl font-black text-cyan-300">90+</p>
            <p className="mt-3 text-slate-400">Teams Analysed</p>
          </div>

          <div className="rounded-3xl bg-white/[0.04] p-8">
            <p className="text-5xl font-black text-cyan-300">370+</p>
            <p className="mt-3 text-slate-400">Matches Processed</p>
          </div>
        </div>
      </section>
    </main>
  );
}
