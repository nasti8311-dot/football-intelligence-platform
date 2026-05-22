import Link from "next/link";

const links = [
  ["/verified-picks", "Daily Picks"],
  ["/public-track-record", "Performance"],
  ["/methodology", "Methodik"],
  ["/disclaimer", "Hinweis"],
];

export default function PremiumFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-10 text-white md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-2xl font-black">Football IQ</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-neutral-500">
            Datenbasierte Fußballprognosen. Täglich aktualisiert. Keine sicheren Tipps.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm font-bold text-neutral-400 hover:text-emerald-300">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
