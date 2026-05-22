import Link from "next/link";

const links = [
  { href: "/verified-picks", label: "Picks" },
  { href: "/public-track-record", label: "Track Record" },
  { href: "/model-quality", label: "Quality" },
  { href: "/quant-hub", label: "Quant Hub" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050707]/85 px-4 py-4 text-white backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400 text-sm font-black text-black">
            IQ
          </div>

          <div>
            <p className="text-sm font-black leading-none">Football IQ</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
              Quant Platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-4 py-2 text-sm font-bold text-neutral-300 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/sharp-feed"
          className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-black text-black"
        >
          Sharp Feed
        </Link>
      </div>
    </header>
  );
}
