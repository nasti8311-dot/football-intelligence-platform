import ProbabilityRing from "./ProbabilityRing";

export default function CleanMatchCard({ p }: any) {
  const match = p.match;

  const home =
    p.homeWinProbability ??
    p.homeWinProb ??
    50;

  const draw =
    p.drawProbability ??
    p.drawProb ??
    25;

  const away =
    p.awayWinProbability ??
    p.awayWinProb ??
    25;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            {match?.league?.name || "Football IQ"}
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            {match?.kickoff
              ? new Date(match.kickoff).toLocaleString("de-DE")
              : "Heute"}
          </p>
        </div>

        <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
          {p.riskLevel || "BALANCED"}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">
              {match?.homeTeam?.name}
            </span>

            <span className="text-sm text-neutral-500">Heim</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">
              {match?.awayTeam?.name}
            </span>

            <span className="text-sm text-neutral-500">Auswärts</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <ProbabilityRing
            label="1"
            value={Math.round(home)}
            color="emerald"
          />

          <ProbabilityRing
            label="X"
            value={Math.round(draw)}
            color="neutral"
          />

          <ProbabilityRing
            label="2"
            value={Math.round(away)}
            color="blue"
          />
        </div>

        <div className="rounded-2xl bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">
              KI Empfehlung
            </span>

            <span className="text-sm font-bold text-white">
              {p.recommendedBet || p.market || "Home Win"}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(8, p.confidence || 72)
                )}%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Confidence</span>
            <span>{Math.round(p.confidence || 72)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
