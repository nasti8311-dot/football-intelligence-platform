import ProbabilityRing from "./ProbabilityRing";

export default function CleanMatchCard({ p }: any) {
  const match = p.match;

  const home = p.homeWinProbability ?? p.homeWinProb ?? 50;
  const draw = p.drawProbability ?? p.drawProb ?? 25;
  const away = p.awayWinProbability ?? p.awayWinProb ?? 25;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            {match?.league?.name || "Football IQ"}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
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

        <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
          {p.riskLevel || "SAFE"}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <TeamRow
          name={match?.homeTeam?.name}
          logo={match?.homeTeam?.crestUrl}
          side="Heim"
        />

        <TeamRow
          name={match?.awayTeam?.name}
          logo={match?.awayTeam?.crestUrl}
          side="Auswärts"
        />

        <div className="grid grid-cols-3 gap-3 pt-1">
          <ProbabilityRing label="1" value={Math.round(home)} color="emerald" />
          <ProbabilityRing label="X" value={Math.round(draw)} color="neutral" />
          <ProbabilityRing label="2" value={Math.round(away)} color="blue" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">
              Pick
            </span>
            <span className="text-right text-sm font-black text-white">
              {p.recommendedBet || p.market || "Beste Quote"}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${Math.min(100, Math.max(8, p.confidence || 72))}%`,
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

function TeamRow({
  name,
  logo,
  side,
}: {
  name?: string;
  logo?: string | null;
  side: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-7 w-7 object-contain" />
          ) : (
            <span className="text-xs font-black text-white">
              {name?.slice(0, 2).toUpperCase() || "FC"}
            </span>
          )}
        </div>

        <span className="truncate font-bold text-white">{name || "Team"}</span>
      </div>

      <span className="shrink-0 text-xs text-neutral-500">{side}</span>
    </div>
  );
}
