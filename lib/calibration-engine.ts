import { prisma } from "@/lib/prisma";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

type BucketStats = {
  total: number;
  correct: number;
};

function bucket(probability: number) {
  return Math.floor(probability * 10) / 10;
}

function bayesianAccuracy(
  correct: number,
  total: number,
  prior = 0.55,
  strength = 12
) {
  return (
    (correct + prior * strength) /
    (total + strength)
  );
}

export async function getCalibrationMap() {
  const resolved =
    await prisma.predictionSnapshot.findMany({
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

  const map =
    new Map<string, BucketStats>();

  for (const row of resolved) {
    const probability =
      Number(row.probability) > 1
        ? Number(row.probability) / 100
        : Number(row.probability);

    const key =
      row.market +
      ":" +
      bucket(probability);

    const current =
      map.get(key) || {
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
  const calibration =
    await getCalibrationMap();

  const normalized =
    probability > 1
      ? probability / 100
      : probability;

  const key =
    market +
    ":" +
    bucket(normalized);

  const sample =
    calibration.get(key);

  if (!sample) {
    return normalized;
  }

  const calibrated =
    bayesianAccuracy(
      sample.correct,
      sample.total
    );

  const sampleWeight =
    clamp(sample.total / 30, 0.08, 0.65);

  const adjusted =
    normalized * (1 - sampleWeight) +
    calibrated * sampleWeight;

  return clamp(adjusted, 0.03, 0.92);
}
