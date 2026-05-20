import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";
import ProbabilityRing from "@/components/picks/ProbabilityRing";
import SavePickButton from "@/components/picks/SavePickButton";

export default function CleanMatchCard({ p }: { p: any }) {
  const home = p.home || p.homeTeam?.name || p.homeTeamName || "Heim";
  const away = p.away || p.awayTeam?.name || p.awayTeamName || "Auswärts";
  const kickoff = p.kickoff ? new Date(p.kickoff) : null;

  const homeWin = Math.round(p.homeWinProbability || p.homeProbability || p.bestProbability || 55);
  const draw = Math.round(p.drawProbability || 24);
  const awayWin = Math.round(p.awayWinProbability || p.awayProbability || 21);
  const btts = Math.round(p.bttsProbability || 58);
  const over25 = Math.round(p.over25Probability || 61);

  const time = kickoff
    ? kickoff.toLocaleString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  return (
    <article className="group rounded-[2rem] border border-white/10 bg-[#07111f]/95 p-4 shadow-2xl shadow-black/30 transition hover:border-cyan-400/30 md:p-5">
      <div className="grid gap-5 md:grid-cols-[1.1fr_0.8fr_0.55fr] md:items-center">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-300">
              {p.league || p.league?.name || "Fußball"}
            </p>

            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
              {time}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="text-center">
              <TeamBadge team={home} size={58} />
              <p className="mt-2 line-clamp-2 text-sm font-black leading-tight text-white">
                {home}
              </p>
            </div>

            <p className="rounded-full bg-white/[0.04] px-3 py-2 text-xs font-black text-slate-500">
              VS
            </p>

            <div className="text-center">
              <TeamBadge team={away} size={58} />
              <p className="mt-2 line-clamp-2 text-sm font-black leading-tight text-white">
                {away}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <ProbabilityRing value={homeWin} label="1" color="#22c55e" />
          <ProbabilityRing value={draw} label="X" color="#eab308" />
          <ProbabilityRing value={awayWin} label="2" color="#ef4444" />
          <ProbabilityRing value={btts} label="BTTS" color="#38bdf8" />
          <ProbabilityRing value={over25} label="Ü2.5" color="#a855f7" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
            Top Pick
          </p>

          <p className="mt-2 text-xl font-black leading-tight text-white">
            {p.bestMarket || "Modell-Pick"}
          </p>

          <p className="mt-2 text-xs font-bold text-slate-500">
            Risiko: {p.riskTier || "BALANCED"}
          </p>

          <div className="mt-4 flex gap-2">
            <SavePickButton
              matchId={p.id}
              market={p.bestMarket}
              pick={p.bestPick || p.bestMarket}
              probability={Math.round(p.bestProbability || 0)}
            />

            <Link
              href={`/matches/${p.id}`}
              className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950"
            >
              Analyse
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
