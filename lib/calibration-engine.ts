import { prisma } from "@/lib/prisma";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type CalibrationBucket = {
  total: number;
  correct: number;
};

function bucket(probability: number) {
  return Math.floor(probability * 10) / 10;
}

export async function getCalibrationMap() {
  const resolved = await prisma.predictionSnapshot.findMany({
    where: {
      isCorrect: {
        not: null,
      },
    },
    select: {
      market: true,
      probability: true,
      isCorrect: true,
    },
  });

  const map = new Map<string, CalibrationBucket>();

  for (const row of resolved) {
    const key =
      row.market +
      ":" +
      bucket(Number(row.probability));

    const current = map.get(key) || {
      total: 0,
      correct: 0,
    };

    current.total += 1;

    if (row.isCorrect) {
      current.correct += 1;
    }

    map.set(key, current);
  }

  return map;
}

export async function calibrateProbability(
  market: string,
  probability: number
) {
  const calibration = await getCalibrationMap();

  const key =
    market +
    ":" +
    bucket(probability);

  const sample = calibration.get(key);

  if (!sample || sample.total < 8) {
    return probability;
  }

  const actualAccuracy =
    sample.correct / sample.total;

  const adjusted =
    probability * 0.45 +
    actualAccuracy * 0.55;

  return clamp(adjusted, 0.02, 0.98);
}
