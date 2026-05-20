import ProbabilityRing from "./ProbabilityRing";

export default function CleanMatchCard({ p }: any) {
  const match = p.match;

  const home = p.homeWinProbability ?? p.homeWinProb ?? 50;
  const draw = p.drawProbability ?? p.drawProb ?? 25;
  const away = p.awayWinProbability ?? p.awayWinProb ?? 25;
  const confidence = Math.round(p.confidence || p.safeScore || 72);

  const bestPick =
    p.recommendedBet ||
    p.market ||
    p.pick ||
    getBestMarket(home, draw, away);

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.06]">
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">
            {match?.league?.name || "Football IQ"}
          </p>

          <p className="mt-1 text-xs font-medium text-neutral-500">
            {match?.kickoff
              ? new Date(match.kickoff).toLocaleString("de-DE", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Heute"}
          </p>
        </div>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black tracking-wide text-emerald-300">
          {p.riskLevel || "SAFE"}
        </div>
      </header>

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <TeamRow
            name={match?.homeTeam?.name}
            logo={match?.homeTeam?.crestUrl}
            side="HEIM"
            probability={Math.round(home)}
          />

          <TeamRow
            name={match?.awayTeam?.name}
            logo={match?.awayTeam?.crestUrl}
            side="AUSW"
            probability={Math.round(away)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ProbabilityRing label="1" value={Math.round(home)} color="emerald" />
          <ProbabilityRing label="X" value={Math.round(draw)} color="neutral" />
          <ProbabilityRing label="2" value={Math.round(away)} color="blue" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                KI Empfehlung
              </p>
              <p className="mt-1 text-base font-black text-white">
                {bestPick}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 px-3 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">
                Trust
              </p>
              <p className="text-sm font-black text-emerald-300">
                {confidence}%
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(8, confidence))}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniMetric label="Value" value={formatNumber(p.valueScore ?? p.value ?? 0)} />
          <MiniMetric label="Quote" value={formatNumber(p.odds ?? p.bestOdds ?? "-")} />
          <MiniMetric label="Risiko" value={p.riskLevel || "SAFE"} />
        </div>
      </div>
    </article>
  );
}

function TeamRow({
  name,
  logo,
  side,
  probability,
}: {
  name?: string;
  logo?: string | null;
  side: string;
  probability: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
          ) : (
            <span className="text-xs font-black text-white">
              {name?.slice(0, 2).toUpperCase() || "FC"}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black text-white">
            {name || "Team"}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
            {side}
          </p>
        </div>
      </div>

      <div className="shrink-0 rounded-xl bg-black/30 px-2.5 py-1 text-xs font-black text-neutral-200">
        {probability}%
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}

function getBestMarket(home: number, draw: number, away: number) {
  if (home >= draw && home >= away) return "Heimsieg";
  if (away >= home && away >= draw) return "Auswärtssieg";
  return "Remis";
}

function formatNumber(value: any) {
  if (typeof value === "number") return value.toFixed(value > 10 ? 0 : 2);
  return value;
}
