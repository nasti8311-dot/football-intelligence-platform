import ProbabilityRing from "./ProbabilityRing";
import { calculateFootballProbabilities } from "@/lib/probability-engine";

export default function CleanMatchCard({ p }: any) {
  const match = p.match;
  const probs = calculateFootballProbabilities(match);

  const confidence = Math.round(p.confidence || p.safeScore || 72);

  const bestPick = getBestPick(probs);

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
            probability={probs.homeWin}
          />

          <TeamRow
            name={match?.awayTeam?.name}
            logo={match?.awayTeam?.crestUrl}
            side="AUSW"
            probability={probs.awayWin}
          />
        </div>

        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
            1X2 Wahrscheinlichkeiten
          </p>

          <div className="grid grid-cols-3 gap-3">
            <ProbabilityRing label="1" value={probs.homeWin} color="emerald" />
            <ProbabilityRing label="X" value={probs.draw} color="neutral" />
            <ProbabilityRing label="2" value={probs.awayWin} color="blue" />
          </div>
        </div>

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
                {bestPick.value}%
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(8, bestPick.value))}%`,
              }}
            />
          </div>
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

function getBestPick(probs: any) {
  const options = [
    { label: "Heimsieg", value: probs.homeWin },
    { label: "Remis", value: probs.draw },
    { label: "Auswärtssieg", value: probs.awayWin },
    { label: "Beide Teams treffen", value: probs.btts },
    { label: "Über 1,5 Tore", value: probs.over15 },
    { label: "Über 2,5 Tore", value: probs.over25 },
    { label: "Unter 2,5 Tore", value: probs.under25 },
    { label: "Unter 3,5 Tore", value: probs.under35 },
  ];

  return options.sort((a, b) => b.value - a.value)[0];
}
