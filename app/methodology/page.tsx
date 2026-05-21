import Link from "next/link";

const sections = [
  {
    title: "1. Datenbasis",
    body:
      "Football IQ nutzt historische Ergebnisse, kommende Fixtures, verfügbare Marktquoten, Teamform und gespeicherte Prediction-Snapshots. Spiele ohne ausreichende Daten werden bewusst abgewertet oder nicht als Verified Pick veröffentlicht.",
  },
  {
    title: "2. Team Strength",
    body:
      "Teams werden über Resultate, Tore, Gegentore, Heim-/Auswärtsprofil, Form und ELO-ähnliche Ratings bewertet. Das Modell unterscheidet zwischen allgemeiner Stärke und aktueller Form.",
  },
  {
    title: "3. xG-Schätzung",
    body:
      "Die erwarteten Tore werden aus Team-Offensive, gegnerischer Defensive, Heim-/Auswärtsprofil und Form abgeleitet. Es handelt sich um eine modellierte xG-Schätzung, nicht um offizielles Event-xG.",
  },
  {
    title: "4. Marktquoten",
    body:
      "Wenn Odds vorhanden sind, nutzt Football IQ Marktinformationen als starken Prior. Die Plattform unterscheidet zwischen Modellwahrscheinlichkeit und Markt-Wahrscheinlichkeit.",
  },
  {
    title: "5. Calibration",
    body:
      "Jede gespeicherte Prediction wird später gegen das echte Ergebnis geprüft. Daraus entstehen Calibration-Buckets, geglättete Trefferquoten und Marktqualität nach Pick-Typ.",
  },
  {
    title: "6. Verified Picks",
    body:
      "Ein Pick wird nur dann verifiziert, wenn Datenqualität, Odds-Verfügbarkeit und Mindestwahrscheinlichkeit erfüllt sind. Ziel ist nicht, jedes Spiel zu tippen, sondern nur veröffentlichbare Signale zu zeigen.",
  },
  {
    title: "7. Grenzen",
    body:
      "Football IQ garantiert keine Gewinne. Fußballmärkte sind effizient, und jedes Modell hat Unsicherheit. Die Plattform priorisiert Transparenz, Messbarkeit und kontinuierliche Verbesserung statt Fake-Confidence.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Transparency
          </p>
          <h1 className="mt-3 text-5xl font-black">Methodik</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Wie Football IQ Wahrscheinlichkeiten, Verified Picks und Modellqualität berechnet.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/quant-hub" className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
              Quant Hub
            </Link>
            <Link href="/model-quality" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white">
              Modellqualität
            </Link>
          </div>
        </section>

        <section className="grid gap-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
            >
              <h2 className="text-xl font-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-400">
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
