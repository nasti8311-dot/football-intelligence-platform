import Link from "next/link";
import PageHero from "@/components/PageHero";

const cards = [
  {
    title: "Best Predictions",
    desc: "Die stärksten Picks mit Wahrscheinlichkeit, Risiko und Erklärung.",
    href: "/best-predictions",
    cta: "Open picks",
  },
  {
    title: "Performance",
    desc: "Prüfe transparent, wie gut das Modell auf vorhandenen Spielen war.",
    href: "/prediction-performance",
    cta: "Check accuracy",
  },
  {
    title: "Match Center",
    desc: "Öffne einzelne Spiele mit Score, Events und Kontext.",
    href: "/match-center",
    cta: "Open matches",
  },
];

export default function PredictionsHubPage() {
  return (
    <main className="min-h-screen stadium-page p-4 pb-24 text-white md:p-6">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        <PageHero
          eyebrow="Prediction Product"
          title="Predictions Hub"
          description="Der einfache Einstieg für Nutzer: beste Picks, Modell-Performance und Match-Kontext."
        />

        <section className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="glass-card rounded-3xl p-6 transition hover:scale-[1.02]"
            >
              <h2 className="text-3xl font-black">{card.title}</h2>
              <p className="mt-4 text-slate-300">{card.desc}</p>
              <p className="mt-6 font-bold text-cyan-300">{card.cta} →</p>
            </Link>
          ))}
        </section>

        <section className="glass-card rounded-3xl p-6">
          <p className="text-sm text-cyan-300">Wichtig für Vertrauen</p>
          <h2 className="mt-2 text-3xl font-black">Keine Blackbox</h2>
          <p className="mt-4 text-slate-300">
            Jede Prediction sollte nachvollziehbar sein: Wahrscheinlichkeit,
            Confidence, Risiko und einfache Erklärung. Genau darauf optimieren wir die Plattform jetzt.
          </p>
        </section>
      </div>
    </main>
  );
}
