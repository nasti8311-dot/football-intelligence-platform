import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">
            Football IQ
          </p>
          <h1 className="mt-3 text-5xl font-black">Legal</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Rechtliche Hinweise, verantwortungsvolle Nutzung und Transparenz.
          </p>
        </section>

        <section className="grid gap-4">
          <Box title="Keine Wettberatung">
            Football IQ stellt Analyseinformationen bereit. Die Plattform ist keine
            Finanz-, Anlage- oder Wettberatung.
          </Box>

          <Box title="Keine Gewinnversprechen">
            Wahrscheinlichkeiten sind keine Garantien. Auch hohe Modellwerte können
            verlieren.
          </Box>

          <Box title="Transparenz">
            Methodik, Track Record und Disclaimer sind öffentlich einsehbar.
          </Box>
        </section>

        <Link href="/disclaimer" className="inline-flex rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black">
          Disclaimer lesen
        </Link>
      </div>
    </main>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-neutral-400">{children}</p>
    </article>
  );
}
