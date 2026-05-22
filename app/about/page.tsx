import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Über Football IQ
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Keine Fake-Tipps. Messbare Fußballmodelle.
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-neutral-400">
            Football IQ ist eine datengetriebene Football Intelligence Plattform.
            Die Plattform kombiniert historische Ergebnisse, Marktquoten, ELO,
            Teamform, xG-Schätzungen, Calibration und Performance Tracking.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/verified-picks" className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
              Verified Picks
            </Link>
            <Link href="/methodology" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white">
              Methodik
            </Link>
            <Link href="/public-track-record" className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white">
              Track Record
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Info title="Was Football IQ macht">
            Football IQ berechnet Wahrscheinlichkeiten, filtert schwache Signale
            aus und veröffentlicht nur Picks, die Mindestanforderungen an Daten,
            Marktinformation und Modellqualität erfüllen.
          </Info>

          <Info title="Was Football IQ nicht macht">
            Football IQ verspricht keine Gewinne, keine sicheren Tipps und keine
            künstlichen 90%-Vorhersagen. Fußball bleibt probabilistisch und
            unsicher.
          </Info>

          <Info title="Warum Calibration wichtig ist">
            Eine Prediction ist nur wertvoll, wenn 60%-Picks langfristig ungefähr
            auch wie 60%-Picks performen. Deshalb misst Football IQ historische
            Trefferquoten nach Markt und Probability-Bucket.
          </Info>

          <Info title="Warum Verified Picks streng sind">
            Nicht jedes Spiel verdient eine Prediction. Wenn Odds fehlen oder die
            Datenqualität schwach ist, wird ein Match nicht als Verified Pick
            veröffentlicht.
          </Info>
        </section>
      </div>
    </main>
  );
}

function Info({
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
