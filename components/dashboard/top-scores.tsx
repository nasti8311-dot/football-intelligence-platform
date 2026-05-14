import { Card } from "@/components/ui/card";
import type { ScoreProbability } from "@/lib/types/football";
import { percent } from "@/lib/utils/format";

export function TopScores({ scores }: { scores: ScoreProbability[] }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Most Likely Scores</h2>
      <div className="mt-5 space-y-3">
        {scores.map((score) => (
          <div key={`${score.homeGoals}-${score.awayGoals}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <span className="text-xl font-semibold text-white">{score.homeGoals}:{score.awayGoals}</span>
            <span className="text-sm text-pitch-400">{percent(score.probability)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
