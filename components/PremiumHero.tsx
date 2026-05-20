import BrandMark from "./BrandMark";

export default function PremiumHero() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur">
      <div className="relative p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-5">
            <BrandMark />

            <div>
              <div className="mb-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                Daily Picks · Risk Control · Value Engine
              </div>

              <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                Smartere Fußball-Picks.
                <span className="block text-neutral-500">
                  Weniger Risiko. Mehr Struktur.
                </span>
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
                Football IQ kombiniert Wahrscheinlichkeiten, Quoten, Risiko-Filter
                und moderne Match Cards zu einer klaren täglichen Entscheidungsansicht.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
            <HeroMetric label="Märkte" value="1X2" />
            <HeroMetric label="Engine" value="SAFE" />
            <HeroMetric label="Sync" value="LIVE" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-4 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}
