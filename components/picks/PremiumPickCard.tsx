type Props = {
  match: string;
  league: string;
  kickoff?: Date | string | null;
  market: string;
  pick: string;
  probability: number;
  confidence?: string | null;
  valueScore?: number | null;
  oddsRows?: number;
};

export default function PremiumPickCard({
  match,
  league,
  kickoff,
  market,
  pick,
  probability,
  confidence,
  valueScore,
  oddsRows = 0,
}: Props) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
            Verified Signal
          </p>

          <h3 className="mt-3 text-xl font-black leading-tight text-white">
            {match}
          </h3>

          <p className="mt-2 text-xs font-bold text-neutral-500">
            {league}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            {kickoff ? new Date(kickoff).toLocaleString("de-DE") : "Kickoff offen"}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-400 px-4 py-3 text-center text-black">
          <p className="text-2xl font-black">
            {Number(probability).toFixed(0)}%
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]">
            Model
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
          {market}
        </p>

        <p className="mt-2 text-3xl font-black text-white">
          {pick}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Confidence" value={confidence || "—"} />
        <Metric label="Value" value={valueScore ?? "—"} />
        <Metric label="Odds Rows" value={oddsRows} />
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}
