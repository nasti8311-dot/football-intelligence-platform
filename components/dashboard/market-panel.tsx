import { Card } from "@/components/ui/card";
import type { BettingMarket } from "@/lib/types/football";
import { percent } from "@/lib/utils/format";

export function MarketPanel({ markets }: { markets: BettingMarket[] }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Market Intelligence</h2>
          <p className="mt-1 text-sm text-slate-400">Faire Quoten ohne Buchmacher-Marge, direkt aus dem Scoregrid.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {markets.map((market) => (
          <div key={market.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-white">{market.label}</p>
              <p className="rounded-full bg-pitch-400/10 px-2.5 py-1 text-xs font-semibold text-pitch-400">{percent(market.probability)}</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">{market.explanation}</p>
            <p className="mt-3 text-xs text-slate-500">Fair Odds <span className="font-semibold text-slate-200">{market.fairOdds.toFixed(2)}</span></p>
          </div>
        ))}
      </div>
    </Card>
  );
}
