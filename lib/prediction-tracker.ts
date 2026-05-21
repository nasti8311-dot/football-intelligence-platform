import { prisma } from "@/lib/prisma";
import { calculateValueSignals } from "@/lib/value-engine";

function getSignal(signals: any[], market: string) {
  return signals.find((s) => s.market === market);
}

export async function savePredictionSnapshot(match: any, probs: any) {
  try {
    const signals = calculateValueSignals(match, probs);

    const best =
      signals.find((signal) => signal.value !== "NONE") ||
      signals[0];

    if (!best) return;

    await prisma.predictionSnapshot.create({
      data: {
        matchId: match.id,

        market: best.market,
        pick: best.market,

        probability: best.modelProbability,

        homeWin: probs.homeWin / 100,
        draw: probs.draw / 100,
        awayWin: probs.awayWin / 100,

        over25: probs.over25 / 100,
        under25: probs.under25 / 100,

        bttsYes: probs.btts / 100,
        bttsNo: 1 - probs.btts / 100,

        homeXg: 0,
        awayXg: 0,

        confidence: probs.dataQuality || "MEDIUM",

        valueScore:
          best.edge != null
            ? Math.round(best.edge * 100)
            : 0,

        oddsPrice:
          best.marketProbability && best.marketProbability > 0
            ? 1 / best.marketProbability
            : null,

        impliedProb: best.marketProbability,

        edge: best.edge,
      },
    });
  } catch (error) {
    console.error("prediction snapshot failed", error);
  }
}
