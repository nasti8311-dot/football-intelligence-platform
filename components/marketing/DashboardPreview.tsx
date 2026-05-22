import Link from "next/link";

const cards = [
  {
    href: "/sharp-feed",
    label: "Sharp Feed",
    value: "Live",
    desc: "Priorisierte Picks mit Odds-Verfügbarkeit.",
  },
  {
    href: "/model-quality",
    label: "Calibration",
    value: "Active",
    desc: "Geglättete Modellqualität pro Markt.",
  },
  {
    href: "/public-track-record",
    label: "Track Record",
    value: "Public",
    desc: "Resolved Predictions transparent sichtbar.",
  },
];

export function DashboardPreview() {
  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-8 md:p-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Platform Preview
          </p>
          <h2 className="mt-3 text-4xl font-black">
            Built like a quant dashboard.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
            Football IQ trennt öffentliche Picks, Modellqualität, Datenlücken,
            Track Record und Operations sauber voneinander.
          </p>
        </div>

        <Link
          href="/quant-hub"
          className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15"
        >
          Quant Hub öffnen
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5 transition hover:border-emerald-400/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-white">{card.label}</p>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black text-emerald-300">
                {card.value}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              {card.desc}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
