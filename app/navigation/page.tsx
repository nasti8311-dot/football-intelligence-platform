import Link from "next/link";

const groups = [
  {
    title: "Public",
    items: [
      ["/", "Home"],
      ["/verified-picks", "Verified Picks"],
      ["/public-track-record", "Track Record"],
      ["/methodology", "Methodology"],
      ["/about", "About"],
      ["/disclaimer", "Disclaimer"],
    ],
  },
  {
    title: "Quant Tools",
    items: [
      ["/quant-hub", "Quant Hub"],
      ["/model-quality", "Model Quality"],
      ["/performance", "Performance"],
      ["/value-analysis", "Value Analysis"],
      ["/xg-lab", "xG Lab"],
      ["/readiness", "Readiness"],
      ["/status", "Status"],
    ],
  },
  {
    title: "System",
    items: [
      ["/contact", "Contact"],
      ["/changelog", "Changelog"],
    ],
  },
];

export default function NavigationPage() {
  return (
    <main className="min-h-screen bg-[#050707] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ
          </p>
          <h1 className="mt-3 text-5xl font-black">Navigation</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Alle wichtigen Plattformbereiche an einem Ort.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.title}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <h2 className="text-2xl font-black">{group.title}</h2>

              <div className="mt-5 grid gap-3">
                {group.items.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-neutral-300 transition hover:border-emerald-400/40 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
