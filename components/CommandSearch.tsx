"use client";

import { useState } from "react";
import Link from "next/link";

const items = [
  ["Dashboard", "/"],
  ["Reports Center", "/reports-center"],
  ["Club House", "/club-house"],
  ["Team Profile", "/team-profile"],
  ["Player Profile", "/player-profile"],
  ["Scout Dashboard", "/scout-dashboard"],
  ["Match Center", "/match-center"],
  ["Opponent Prep", "/opponent-prep"],
  ["Event Map", "/event-map"],
  ["Data Health", "/data-health"],
  ["Upload", "/upload-center"],
];

export default function CommandSearch() {
  const [q, setQ] = useState("");

  const results = items.filter(([label]) =>
    label.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="glass-card relative rounded-3xl p-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search: teams, reports, scout, match..."
        className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
      />

      {q && (
        <div className="absolute left-4 right-4 top-20 z-50 rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-2xl">
          {results.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-cyan-300"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
