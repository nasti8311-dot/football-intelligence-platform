import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/public-track-record", label: "Track Record" },
  { href: "/verified-picks", label: "Verified Picks" },
  { href: "/model-quality", label: "Model Quality" },
  { href: "/quant-hub", label: "Quant Hub" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/contact", label: "Contact" },
  { href: "/changelog", label: "Changelog" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30 px-4 py-10 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
            Football IQ
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Quantitative Football Intelligence
          </h2>

          <p className="mt-4 text-sm leading-7 text-neutral-400">
            Datengetriebene Fußballmodelle mit Calibration, Verified Picks,
            Track Record und transparenter Modellqualität.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-bold text-neutral-300 transition hover:border-emerald-400/30 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-xs text-neutral-500">
        Football IQ · Probabilistische Modelle · Keine Gewinn-Garantien
      </div>
    </footer>
  );
}
