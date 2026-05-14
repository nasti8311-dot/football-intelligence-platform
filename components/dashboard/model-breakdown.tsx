import { Card } from "@/components/ui/card";
import type { MatchPrediction } from "@/lib/types/football";

export function ModelBreakdown({ prediction }: { prediction: MatchPrediction }) {
  const rows = Array.from(new Set([...Object.keys(prediction.breakdown.home), ...Object.keys(prediction.breakdown.away)]));

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">xG Model Inspector</h2>
      <p className="mt-1 text-sm text-slate-400">Transparente Faktoren, die in die Expected-Goals-Schätzung einfließen.</p>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Faktor</th>
              <th className="px-4 py-3 text-right">{prediction.homeTeam.shortName}</th>
              <th className="px-4 py-3 text-right">{prediction.awayTeam.shortName}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-t border-white/10">
                <td className="px-4 py-3 text-slate-300">{row}</td>
                <td className="px-4 py-3 text-right text-white">{prediction.breakdown.home[row]?.toFixed(3) ?? "—"}</td>
                <td className="px-4 py-3 text-right text-white">{prediction.breakdown.away[row]?.toFixed(3) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Covered mass before normalization: {(prediction.coveredMass * 100).toFixed(2)}% bei 0–{prediction.config.maxGoals} Toren.</p>
    </Card>
  );
}
