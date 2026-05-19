type Props = {
  match: string;
  league?: string;
  market: string;
  probability: number;
  edge?: number;
  confidence?: string;
  kickoff?: string;
  home?: string;
  away?: string;
  reasoning?: string[];
};

function getGlow(prob: number) {
  if (prob >= 80) return "shadow-emerald-500/30 border-emerald-400/30";
  if (prob >= 70) return "shadow-cyan-500/30 border-cyan-400/30";
  return "shadow-yellow-500/20 border-yellow-400/20";
}

function getLabel(prob: number) {
  if (prob >= 80) return "ELITE EDGE";
  if (prob >= 70) return "STRONG";
  return "WATCHLIST";
}

export default function PremiumPickCard({
  match,
  league,
  market,
  probability,
  edge,
  kickoff,
  reasoning,
}: Props) {
  return (
    <article
      className={`glass-card relative overflow-hidden rounded-[2rem] border p-6 shadow-2xl ${getGlow(probability)}`}
    >
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
            {league || "Football Intelligence"}
          </p>

          <h2 className="mt-3 text-2xl font-black text-white">
            {match}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {market}
          </p>
        </div>

        <div className="text-right">
          <div className="rounded-2xl bg-slate-950/70 px-4 py-3">
            <p className="text-xs font-black tracking-[0.2em] text-cyan-300">
              {getLabel(probability)}
            </p>

            <p className="mt-1 text-4xl font-black text-white">
              {probability}%
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Edge
          </p>
          <p className="mt-1 text-lg font-black text-emerald-300">
            {edge ?? 0}%
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Risk
          </p>
          <p className="mt-1 text-lg font-black text-yellow-300">
            Low
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Updated
          </p>
          <p className="mt-1 text-lg font-black text-cyan-300">
            Live
          </p>
        </div>
      </div>

      {reasoning?.length ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            AI Reasoning
          </p>

          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {reasoning.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {kickoff ? (
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-500">
          Kickoff · {new Date(kickoff).toLocaleString("de-DE")}
        </p>
      ) : null}
    </article>
  );
}
