import type { AdvancedTeamForm } from "@/lib/team-form-engine";

export type ExpectedGoalsInput = {
  home?: AdvancedTeamForm;
  away?: AdvancedTeamForm;
};

export type ExpectedGoalsOutput = {
  homeXg: number;
  awayXg: number;
  totalXg: number;
  tempo: "LOW" | "MEDIUM" | "HIGH";
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function estimateExpectedGoals({
  home,
  away,
}: ExpectedGoalsInput): ExpectedGoalsOutput {
  const homeAttack = home?.homeAttack || home?.attackStrength || 1.25;
  const awayAttack = away?.awayAttack || away?.attackStrength || 1.05;

  const homeDefenseAllowed = home?.defenseStrength || 1.15;
  const awayDefenseAllowed = away?.defenseStrength || 1.25;

  const homeForm = home?.formIndex ?? 0.5;
  const awayForm = away?.formIndex ?? 0.5;

  let homeXg =
    homeAttack * 0.55 +
    awayDefenseAllowed * 0.35 +
    0.25 +
    (homeForm - 0.5) * 0.25;

  let awayXg =
    awayAttack * 0.55 +
    homeDefenseAllowed * 0.35 +
    0.05 +
    (awayForm - 0.5) * 0.2;

  homeXg = clamp(homeXg, 0.35, 3.4);
  awayXg = clamp(awayXg, 0.25, 3.1);

  const totalXg = homeXg + awayXg;

  return {
    homeXg,
    awayXg,
    totalXg,
    tempo:
      totalXg >= 3.1
        ? "HIGH"
        : totalXg <= 2.2
          ? "LOW"
          : "MEDIUM",
  };
}
