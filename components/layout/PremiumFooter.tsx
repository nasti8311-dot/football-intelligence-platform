import Link from "next/link";

const cols = [
  {
    title: "Platform",
    links: [
      ["/verified-picks", "Verified Picks"],
      ["/sharp-feed", "Sharp Feed"],
      ["/quant-hub", "Quant Hub"],
    ],
  },
  {
    title: "Analytics",
    links: [
      ["/model-quality", "Model Quality"],
      ["/public-track-record", "Track Record"],
      ["/ops-center", "Ops Center"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/about", "About"],
      ["/press", "Press"],
      ["/legal", "Legal"],
    ],
  },
];

export default function PremiumFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-12 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 font-black text-black">
            IQ
          </div>
          <h3 className="mt-4 text-2xl font-black">Football IQ</h3>
          <p className="mt-4 text-sm leading-7 text-neutral-500">
            Quantitative Football Intelligence mit Verified Picks,
            Calibration und transparentem Track Record.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-neutral-500">
              {col.title}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {col.links.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-bold text-neutral-300 transition hover:text-emerald-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
