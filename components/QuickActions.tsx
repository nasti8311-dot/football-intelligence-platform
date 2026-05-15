import Link from "next/link";

const actions = [
  ["Scout Dashboard", "/scout-dashboard"],
  ["Club House", "/club-house"],
  ["Reports Center", "/reports-center"],
  ["Match Center", "/match-center"],
  ["Opponent Prep", "/opponent-prep"],
  ["Upload Data", "/upload-center"],
];

export default function QuickActions() {
  return (
    <section className="glass-card rounded-3xl p-6">
      <div className="mb-6">
        <p className="text-sm text-cyan-300">
          Quick Navigation
        </p>

        <h2 className="mt-1 text-3xl font-black">
          Actions
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl bg-slate-950/60 p-5 text-center font-bold transition hover:bg-cyan-400 hover:text-slate-950"
          >
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
