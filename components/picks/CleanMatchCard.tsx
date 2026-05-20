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

  return (
    <article className="rounded-[2rem] border border-white/10 bg-[#07111f]/95 p-5 shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            {p.league || p.league?.name || "Fußball"}
          </p>

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-5">
            <div className="text-center">
              <TeamBadge team={home} size={70} />
              <p className="mt-3 max-w-[130px] text-sm font-black text-white">{home}</p>
            </div>

            <p className="text-2xl font-black text-slate-500">VS</p>

            <div className="text-center">
              <TeamBadge team={away} size={70} />
              <p className="mt-3 max-w-[130px] text-sm font-black text-white">{away}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Anstoß</p>
          <p className="mt-2 text-2xl font-black text-white">
            {kickoff
              ? kickoff.toLocaleString("de-DE", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "TBA"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-5">
        <ProbabilityRing value={homeWin} label="Heimsieg" color="#22c55e" />
        <ProbabilityRing value={draw} label="Remis" color="#eab308" />
        <ProbabilityRing value={awayWin} label="Auswärtssieg" color="#ef4444" />
        <ProbabilityRing value={btts} label="BTTS" color="#38bdf8" />
        <ProbabilityRing value={over25} label="Über 2.5" color="#a855f7" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
            Top Pick
          </p>
          <p className="mt-1 text-2xl font-black text-white">
            {p.bestMarket || "Modell-Pick"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Risiko: {p.riskTier || "BALANCED"}
          </p>
        </div>

        <div className="flex gap-3">
          <SavePickButton
            matchId={p.id}
            market={p.bestMarket}
            pick={p.bestPick || p.bestMarket}
            probability={Math.round(p.bestProbability || 0)}
          />

          <Link
            href={`/matches/${p.id}`}
            className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950"
          >
            Analyse
          </Link>
        </div>
      </div>
    </article>
  );
}
