type Props = {
  match: string;
  league: string;
  kickoff?: Date | string | null;
  market: string;
  pick: string;
  probability: number;
  confidence?: string | null;
  valueScore?: number | null;
  score?: number | null;
  oddsRows?: number;
  over15?: number;
  over25?: number;
  under35?: number;
  btts?: number;
};

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-black text-white">
        {value}
      </div>
    </div>
  );
}

export default function PremiumPickCard({
  match,
  league,
  kickoff,
  market,
  pick,
  probability,
  confidence,
  valueScore,
  score,
  oddsRows = 0,
  over15,
  over25,
  under35,
  btts,
}: Props) {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#111827] to-[#0b1220] p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-cyan-500/10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            {league}
          </div>

          <h3 className="mt-2 text-2xl font-black leading-tight text-white">
            {match}
          </h3>

          <p className="mt-2 text-sm text-neutral-400">
            {kickoff
              ? new Date(kickoff).toLocaleString("de-DE")
              : "Kickoff folgt"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">

          {valueScore && valueScore >= 92 ? (
            <span className="rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-black">
              TOP PICK
            </span>
          ) : null}
          {probability >= 78 ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-300">
              Elite Pick
            </span>
          ) : probability >= 70 ? (
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300">
              Strong Edge
            </span>
          ) : null}

          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white">
            {confidence}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-neutral-500">
          <span>Edge Meter</span>
          <span>{valueScore ?? score ?? 0}/100</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
            style={{
              width: `${Math.min(Number(valueScore ?? score ?? 0), 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Metric label="Markt" value={market} />
        <Metric label="Tipp" value={pick} />
        <Metric label="Wahrscheinlichkeit" value={`${probability}%`} />
        <Metric label="Modellwert" value={valueScore ?? score ?? "—"} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Ü1.5" value={over15 ? `${over15}%` : "—"} />
        <Metric label="Ü2.5" value={over25 ? `${over25}%` : "—"} />
        <Metric label="U3.5" value={under35 ? `${under35}%` : "—"} />
        <Metric label="BTTS" value={btts ? `${btts}%` : "—"} />
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-neutral-500">
        <span>{oddsRows} Quotenquellen</span>
        <span>Football IQ Modell</span>
      </div>
    </article>
  );
}
