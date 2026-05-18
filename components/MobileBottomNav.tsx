"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["🏠", "/", "Top 10"],
  ["📰", "/news", "News"],
  ["📊", "/prediction-performance", "Stats"],
  ["⭐", "/elo-ratings", "Ratings"],
  ["⚙️", "/system-status", "System"],
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5">
        {items.map(([icon, href, label]) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 py-3 text-xs ${
                active ? "text-cyan-300" : "text-slate-500"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
