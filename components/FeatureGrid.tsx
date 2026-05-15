import Link from "next/link";

const features = [
  { title: "Reports Center", href: "/reports-center", desc: "Coach-, Scout- und Gegnerberichte." },
  { title: "Club House", href: "/club-house", desc: "Alle Clubs als moderne Karten." },
  { title: "Scout Dashboard", href: "/scout-dashboard", desc: "Spieler-Rankings und Rollen." },
  { title: "Match Center", href: "/match-center", desc: "Einzelne Spiele analysieren." },
  { title: "Opponent Prep", href: "/opponent-prep", desc: "Gegner vorbereiten." },
  { title: "Data Health", href: "/data-health", desc: "Datenqualität prüfen." },
];

export default function FeatureGrid() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {features.map((f) => (
        <Link
          key={f.href}
          href={f.href}
          className="glass-card group rounded-3xl p-7 transition hover:scale-[1.02]"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-3xl">
            ⚽
          </div>
          <h2 className="text-2xl font-black group-hover:text-cyan-300">{f.title}</h2>
          <p className="mt-3 text-slate-400">{f.desc}</p>
          <p className="mt-6 text-sm font-bold text-cyan-300">Open →</p>
        </Link>
      ))}
    </section>
  );
}
