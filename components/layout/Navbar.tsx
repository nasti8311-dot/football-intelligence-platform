import Link from "next/link";

const links = [
  { href: "/", label: "Start" },
  { href: "/daily-picks", label: "Daily Picks" },
  { href: "/public-track-record", label: "Performance" },
  { href: "/methodology", label: "Methodik" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050707]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 font-black text-black shadow-lg shadow-emerald-500/20">
            IQ
          </div>

          <div>
            <p className="text-sm font-black text-white">
              Football IQ
            </p>

            <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              Fußball Prognosen
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto md:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold text-neutral-300 transition hover:bg-white/10 hover:text-white md:px-4 md:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
