import { Card } from "@/components/ui/card";
import type { ScoreProbability } from "@/lib/types/football";
import { percent } from "@/lib/utils/format";

interface ScoreMatrixProps {
  matrix: ScoreProbability[];
  maxGoals: number;
}

export function ScoreMatrix({ matrix, maxGoals }: ScoreMatrixProps) {
  const probabilityFor = (homeGoals: number, awayGoals: number) => matrix.find((cell) => cell.homeGoals === homeGoals && cell.awayGoals === awayGoals)?.probability ?? 0;
  const goals = Array.from({ length: maxGoals + 1 }, (_, index) => index);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Score Probability Matrix</h2>
      <p className="mt-1 text-sm text-slate-400">Zeilen = Heimtore, Spalten = Auswärtstore. Die Matrix ist auf die sichtbare Tor-Masse normalisiert.</p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-2 text-sm">
          <thead>
            <tr>
              <th className="text-left text-slate-500">H/A</th>
              {goals.map((goal) => <th key={goal} className="text-center text-slate-500">{goal}</th>)}
            </tr>
          </thead>
          <tbody>
            {goals.map((homeGoals) => (
              <tr key={homeGoals}>
                <td className="font-medium text-slate-400">{homeGoals}</td>
                {goals.map((awayGoals) => {
                  const probability = probabilityFor(homeGoals, awayGoals);
                  return (
                    <td key={`${homeGoals}-${awayGoals}`} className="rounded-2xl border border-white/5 bg-white/[0.04] p-3 text-center text-slate-200" style={{ opacity: 0.42 + probability * 7 }}>
                      {percent(probability)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
