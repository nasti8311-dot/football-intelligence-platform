export default function PremiumHero() {
  return (
    <section className="rounded-[2.2rem] border border-white/10 bg-[#07111f]/90 p-6 shadow-2xl shadow-black/30 md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300">
            Heute im Modell
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">
            Starke Picks.
            <br />
            Klar visualisiert.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-slate-400">
            Wahrscheinlichkeiten, Risiko und Top-Pick auf einen Blick.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-3">
          <MiniStat value="5–10" label="Picks" />
          <MiniStat value="Live" label="Sync" />
          <MiniStat value="Risk" label="Filter" />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 px-4 py-3 text-center">
      <p className="text-lg font-black text-cyan-300">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
