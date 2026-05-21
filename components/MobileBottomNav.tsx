import Link from "next/link";

const items = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/daily-picks", label: "Picks", icon: "◆" },
  { href: "/matches", label: "Spiele", icon: "◉" },
  { href: "/news", label: "News", icon: "✦" },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/80 px-3 pb-4 pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-3xl border border-white/10 bg-white/[0.04] p-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="mt-1 text-[10px] font-black uppercase tracking-[0.12em]">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
