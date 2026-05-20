"use client";

type Props = {
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoff: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  btts: number;
  over25: number;
  confidence: string;
  odds?: number;
};

function Ring({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const deg = Math.round((value / 100) * 360);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${deg}deg, rgba(255,255,255,0.08) 0deg)`,
        }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#07111f]">
          <span className="text-sm font-black text-white">{value}%</span>
        </div>
      </div>

      <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
        {label}
      </span>
    </div>
  );
}

export default function ModernMatchCard(props: Props) {
  const {
    homeTeam,
    awayTeam,
    league,
    kickoff,
    homeWin,
    draw,
    awayWin,
    btts,
    over25,
    confidence,
    odds,
  } = props;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#07111f]/95 shadow-2xl shadow-black/40">
      <div className="border-b border-white/5 bg-gradient-to-r from-cyan-400/10 to-emerald-400/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">
              {league}
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-white">
              {homeTeam}
            </h2>

            <p className="my-2 text-lg font-black text-cyan-300">VS</p>

            <h2 className="text-3xl font-black leading-tight text-white">
              {awayTeam}
            </h2>
          </div>

          <div className="text-right">
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Spielbeginn
              </p>

              <p className="mt-1 text-xl font-black text-white">
                {kickoff}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-emerald-400/15 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                Risiko
              </p>

              <p className="mt-1 text-lg font-black text-white">
                {confidence}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-5">
        <Ring value={homeWin} label="Heimsieg" color="#22c55e" />
        <Ring value={draw} label="Unentschieden" color="#facc15" />
        <Ring value={awayWin} label="Auswärtssieg" color="#ef4444" />
        <Ring value={btts} label="BTTS" color="#38bdf8" />
        <Ring value={over25} label="Über 2.5" color="#a855f7" />
      </div>

      <div className="border-t border-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Modellbewertung
            </p>

            <p className="mt-2 text-3xl font-black text-white">
              Premium Pick
            </p>
          </div>

          {odds ? (
            <div className="rounded-2xl bg-cyan-400 px-6 py-4 text-center">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-950">
                Quote
              </p>

              <p className="text-3xl font-black text-slate-950">
                {odds.toFixed(2)}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
