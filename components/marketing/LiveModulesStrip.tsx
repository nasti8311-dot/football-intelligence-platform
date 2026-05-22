import Link from "next/link";

const modules = [
  { href: "/verified-picks", label: "Verified Picks" },
  { href: "/sharp-feed", label: "Sharp Feed" },
  { href: "/model-quality", label: "Model Quality" },
  { href: "/public-track-record", label: "Track Record" },
  { href: "/ops-center", label: "Ops Center" },
  { href: "/match-center", label: "Match Center" },
];

export function LiveModulesStrip() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">
        Live Modules
      </p>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="min-w-fit rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-black text-neutral-300 transition hover:border-emerald-400/40 hover:text-white"
          >
            {m.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
