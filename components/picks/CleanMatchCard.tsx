import ProbabilityRing from "./ProbabilityRing";
import { calculateFootballProbabilities } from "@/lib/probability-engine";
import { selectBestPick } from "@/lib/pick-selector";
import { explainPrediction } from "@/lib/prediction-explainer";
import { calculateTrustScore } from "@/lib/trust-score";
import { calculateValueSignals, getBestValueSignal } from "@/lib/value-engine";
import { getDataQualityLabel, getRatingLabel } from "@/lib/data-quality";

export default function CleanMatchCard({ p, ratings, forms, elo }: any) {
  const match = p.match;
  const probs = await calculateFootballProbabilities(match, ratings, elo);
  const isLowData = probs.dataQuality === "LOW";
  const hasOdds =
    (Array.isArray(match?.odds) && match.odds.length > 0) ||
    (Array.isArray(match?.bookmakerOdds) && match.bookmakerOdds.length > 0);

  const bestPick = isLowData
    ? {
        label: "Keine seriöse Prognose",
        probability: 0,
        risk: "HOCH" as const,
        score: 0,
        reason: "Für dieses Spiel fehlen aktuell ausreichende Quoten- oder Formdaten.",
      }
    : selectBestPick(probs);

  const confidence = calculateTrustScore({
    probs,
    pick: bestPick,
    home: ratings?.home,
    away: ratings?.away,
    hasOdds,
  });

  const explanation = explainPrediction({
    probs,
    home: ratings?.home,
    away: ratings?.away,
  });

  const valueSignals = calculateValueSignals(match, probs);
  const bestValue = getBestValueSignal(valueSignals);

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur">
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
          {p.riskLevel || probs.dataQuality}
        </div>
      </header>

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <TeamRow name={match?.homeTeam?.name} logo={match?.homeTeam?.crestUrl} side="HEIM" probability={probs.homeWin} />
          <TeamRow name={match?.awayTeam?.name} logo={match?.awayTeam?.crestUrl} side="AUSW" probability={probs.awayWin} />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <DataMetric label="Daten" value={getDataQualityLabel(probs.dataQuality)} />
          <DataMetric label="Heim Angriff" value={getRatingLabel(ratings?.home?.attack)} />
          <DataMetric label="Ausw. Angriff" value={getRatingLabel(ratings?.away?.attack)} />
        </div>

        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            1X2 Wahrscheinlichkeiten
          </p>

          {isLowData ? (
            <div className="rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Keine belastbaren Prognosen verfügbar. Es fehlen Quoten oder genügend historische Teamdaten.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <ProbabilityRing label="1" value={probs.homeWin} color="emerald" />
              <ProbabilityRing label="X" value={probs.draw} color="neutral" />
              <ProbabilityRing label="2" value={probs.awayWin} color="blue" />
            </div>
          )}
        </div>

        {!isLowData ? (
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
              Tore & Beide Treffen
            </p>

            <div className="grid grid-cols-2 gap-3">
              <ProbabilityRing label="BTTS" value={probs.btts} color="emerald" />
              <ProbabilityRing label="Ü1.5" value={probs.over15} color="blue" />
              <ProbabilityRing label="Ü2.5" value={probs.over25} color="blue" />
              <ProbabilityRing label="U2.5" value={probs.under25} color="neutral" />
              <ProbabilityRing label="U3.5" value={probs.under35} color="neutral" />
              <ProbabilityRing label="Trust" value={confidence} color="emerald" />
            </div>
          </div>
        ) : null}

        <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                Bester KI-Tipp
              </p>
              <p className="mt-1 text-base font-black text-white">
                {bestPick.label}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 px-3 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">
                Chance
              </p>
              <p className="text-sm font-black text-emerald-300">
                {bestPick.probability > 0 ? `${bestPick.probability}%` : "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
                Warum?
              </span>
              <span className="text-xs font-black text-emerald-300">
                {bestPick.risk}
              </span>
            </div>

            <p className="mt-2 text-xs font-bold text-white">
              {explanation.headline}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {explanation.factors.map((factor: string) => (
                <span key={factor} className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-bold text-neutral-300">
                  {factor}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-neutral-500">
              {bestPick.reason}
            </p>

            {bestValue ? (
              <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    Value Signal
                  </span>
                  <span className="text-xs font-black text-emerald-200">
                    +{Math.round((bestValue.edge || 0) * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-white">
                  {bestValue.market}
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Modell {Math.round(bestValue.modelProbability * 100)}% vs. Markt {bestValue.marketProbability != null ? Math.round(bestValue.marketProbability * 100) : "—"}%
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function DataMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-2 py-2 text-center">
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 truncate text-[11px] font-black text-white">
        {value}
      </p>
    </div>
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
        {probability > 0 ? `${probability}%` : "—"}
      </div>
    </div>
  );
}
