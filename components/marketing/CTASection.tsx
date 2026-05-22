import Link from "next/link";

export function CTASection() {
  return (
    <section className="rounded-[2.5rem] border border-emerald-400/20 bg-emerald-500/10 p-8 text-white md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
            Start here
          </p>

          <h2 className="mt-3 text-4xl font-black">
            View today&apos;s strongest signals.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-100/80">
            Nur Picks mit Datenqualität, Odds-Verfügbarkeit und Verifikationslogik.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/verified-picks"
            className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-black text-black"
          >
            Verified Picks
          </Link>

          <Link
            href="/public-track-record"
            className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white"
          >
            Track Record
          </Link>
        </div>
      </div>
    </section>
  );
}
