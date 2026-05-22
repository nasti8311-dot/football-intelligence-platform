import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-black to-black p-8 md:p-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_35%)]" />

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-emerald-300">
          Football IQ Quant Platform
        </div>

        <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
          Quantitative
          <br />
          Football
          <span className="text-emerald-400"> Intelligence</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-400 md:text-lg">
          Verified Picks, Calibration, Track Record, xG, ELO und datengetriebene
          Football Intelligence — gebaut wie ein echtes Quant-System.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/verified-picks"
            className="rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-black text-black transition hover:scale-[1.02]"
          >
            View Verified Picks
          </Link>

          <Link
            href="/platform"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-black text-white transition hover:border-emerald-400/40"
          >
            Explore Platform
          </Link>
        </div>
      </div>
    </section>
  );
}
