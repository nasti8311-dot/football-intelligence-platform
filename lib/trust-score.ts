import type { FootballProbabilities } from "@/lib/probability-engine";
import type { SelectedPick } from "@/lib/pick-selector";
import type { TeamRating } from "@/lib/team-rating-engine";

export function calculateTrustScore({
  probs,
  pick,
  home,
  away,
  hasOdds,
}: {
  probs: FootballProbabilities;
  pick: SelectedPick;
  home?: TeamRating;
  away?: TeamRating;
  hasOdds?: boolean;
}) {
  const sorted1x2 = [probs.homeWin, probs.draw, probs.awayWin].sort((a, b) => b - a);
  const edge = sorted1x2[0] - sorted1x2[1];

  const sample =
    ((home?.sampleSize || 0) + (away?.sampleSize || 0)) / 2;

  let trust = 42;

  trust += Math.min(16, edge * 0.7);
  trust += Math.min(18, Math.max(0, pick.probability - 50) * 0.45);
  trust += Math.min(10, sample * 0.8);

  if (hasOdds) trust += 8;

  if (pick.risk === "NIEDRIG") trust += 6;
  if (pick.risk === "HOCH") trust -= 8;

  return Math.round(Math.min(91, Math.max(38, trust)));
}
