import Link from "next/link";

export default function PressPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ
          </p>
          <h1 className="mt-3 text-5xl font-black">Press Kit</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Kurzprofil, Plattformbeschreibung und öffentliche Links für Football IQ.
          </p>
        </section>

        <section className="grid gap-4">
          <Box title="Kurzbeschreibung">
            Football IQ ist eine quantitative Football Intelligence Plattform mit
            datengetriebenen Predictions, Verified Picks, Calibration, Track Record
            und transparenter Modellqualität.
          </Box>

          <Box title="Positionierung">
            Keine Fake-Tipps, keine sicheren Wettscheine, sondern probabilistische
            Analyse mit messbarer historischer Performance.
          </Box>

          <Box title="Wichtige Links">
            <div className="flex flex-wrap gap-3">
              <Link href="/verified-picks" className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-black">
                Verified Picks
              </Link>
              <Link href="/methodology" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white">
                Methodology
              </Link>
              <Link href="/public-track-record" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white">
                Track Record
              </Link>
            </div>
          </Box>
        </section>
      </div>
    </main>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-neutral-400">{children}</div>
    </article>
  );
}
