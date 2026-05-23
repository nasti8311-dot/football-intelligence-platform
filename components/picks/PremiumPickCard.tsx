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
  under35?: number;
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
  score,
  oddsRows = 0,
  over15,
  under35,
}: Props) {
  return (
    <article className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-2xl shadow-black/30 transition hover:translate-y-[-2px] hover:border-emerald-400/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
            Empfehlung
          </p>

          <h3 className="mt-3 text-xl font-black leading-tight text-white">
            {match}
          </h3>

          <p className="mt-2 text-xs font-bold text-neutral-500">
            {league}
          </p>

          <p className="mt-1 text-xs text-neutral-500">
            {kickoff ? new Date(kickoff).toLocaleString("de-DE") : "Zeit offen"}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-400 px-4 py-3 text-center text-black">
          <p className="text-2xl font-black">
            {Math.round(Number(probability))}%
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.18em]">
            Chance
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">
          {market}
        </p>

        <p className="mt-2 text-3xl font-black text-emerald-50">
          {pick}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MarketProbability label="Ü1,5" value={over15} />
        <MarketProbability label="U3,5" value={under35} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric label="Qualität" value={confidence || "Geprüft"} />
        <Metric label="Rating" value={valueScore ?? score ?? "—"} />
        <Metric label="Status" value={oddsRows > 0 ? "Geprüft" : "Modell"} />
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


function MarketProbability({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-white">
        {value != null ? `${Math.round(value)}%` : "—"}
      </p>
    </div>
  );
}
