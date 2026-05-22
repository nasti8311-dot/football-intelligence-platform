import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
            Responsible Use
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Disclaimer
          </h1>

          <p className="mt-5 text-sm leading-7 text-neutral-400">
            Football IQ stellt datenbasierte Fußballanalysen, Wahrscheinlichkeiten
            und Modellbewertungen bereit. Die Inhalte sind keine Finanzberatung,
            keine Wettberatung und keine Garantie für Gewinne.
          </p>

          <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5 text-sm leading-7 text-yellow-100">
            Fußball bleibt unsicher. Auch hohe Wahrscheinlichkeiten können verlieren.
            Nutze die Plattform als Analysewerkzeug, nicht als Versprechen.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/methodology" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white">
              Methodik lesen
            </Link>
            <Link href="/public-track-record" className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
              Track Record
            </Link>
          </div>
        </section>

        <section className="grid gap-4">
          <Box title="Keine sicheren Tipps">
            Es gibt keine sicheren Fußballwetten. Football IQ zeigt Wahrscheinlichkeiten,
            keine Garantien.
          </Box>

          <Box title="Modelle haben Grenzen">
            Daten können fehlen, Odds können sich ändern, Teamsituationen können
            kurzfristig wechseln und Märkte können effizienter sein als das Modell.
          </Box>

          <Box title="Transparenz statt Hype">
            Football IQ zeigt Performance, Calibration und Schwächen des Modells
            offen an. Schlechte Märkte werden nicht versteckt.
          </Box>

          <Box title="Verantwortung">
            Nutzer sind selbst verantwortlich für Entscheidungen, die sie aus den
            Analysen ableiten.
          </Box>
        </section>
      </div>
    </main>
  );
}

function Box({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-neutral-400">{children}</p>
    </article>
  );
}
