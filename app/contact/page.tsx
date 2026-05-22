export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Contact
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-neutral-400">
            Fragen, Feedback, Kooperationen oder API-/Data-Anfragen.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              Plattform
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Football IQ
            </h2>

            <p className="mt-4 text-sm leading-7 text-neutral-400">
              Quantitative Football Intelligence Plattform mit probabilistischen
              Modellen, Calibration und Verified Picks.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
              Kontakt
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-black text-white">
                  E-Mail
                </p>

                <p className="mt-1 text-sm text-neutral-400">
                  contact@footballiq.ai
                </p>
              </div>

              <div>
                <p className="text-sm font-black text-white">
                  Themen
                </p>

                <ul className="mt-2 space-y-2 text-sm text-neutral-400">
                  <li>• Partnerships</li>
                  <li>• API Access</li>
                  <li>• Research</li>
                  <li>• Feedback</li>
                  <li>• Data Issues</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
