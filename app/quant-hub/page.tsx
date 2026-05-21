import Link from "next/link";

const items = [
  {
    href: "/verified-picks",
    title: "Verified Picks",
    desc: "Nur Picks mit Odds, Datenqualität und Mindestwahrscheinlichkeit.",
  },
  {
    href: "/model-quality",
    title: "Modellqualität",
    desc: "Calibration, Marktqualität und geglättete Trefferquoten.",
  },
  {
    href: "/performance",
    title: "Performance",
    desc: "Resolved Picks, Accuracy und Marktübersicht.",
  },
  {
    href: "/value-analysis",
    title: "Value Analyse",
    desc: "Model Probability vs. Market Probability.",
  },
];

export default function QuantHubPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ Quant Platform
          </p>
          <h1 className="mt-3 text-5xl font-black">Quant Hub</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-400">
            Zentrale für verified Picks, Modellqualität, Performance und Value-Kontrolle.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
            >
              <p className="text-2xl font-black">{item.title}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                {item.desc}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
