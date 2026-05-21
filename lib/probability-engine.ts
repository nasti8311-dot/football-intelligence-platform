import type { TeamRating } from "@/lib/team-rating-engine";
import { eloWinProbability } from "@/lib/elo-engine";
import { calibrateProbability } from "@/lib/calibration-engine";
import type { EloTeamRating } from "@/lib/elo-engine";
import { estimateExpectedGoals } from "@/lib/xg-engine";

export type FootballProbabilities = {
  homeWin: number;
  draw: number;
  awayWin: number;
  btts: number;
  over15: number;
  over25: number;
  under25: number;
  under35: number;
  dataQuality: "LOW" | "MEDIUM" | "HIGH";
};

function clamp(value: number, min = 1, max = 99) {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number, min = 1, max = 99) {
  return clamp(Math.round(value * 100), min, max);
}

function impliedFromPrice(price: number) {
  return price > 1 ? 1 / price : 0;
}

function avg(values: number[]) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getRows(match: any) {
  return Array.isArray(match?.bookmakerOdds) ? match.bookmakerOdds : [];
}

function marketProbability(
  match: any,
  type: "over" | "under" | "btts",
  line?: number
) {
  const rows = getRows(match);

  const values = rows
    .filter((o: any) => {
      const market = String(o.market || "").toLowerCase();
      const outcome = String(o.outcome || "").toLowerCase();

      if (type === "btts") {
        return (
          market.includes("btts") ||
          market.includes("both teams") ||
          market.includes("both_teams")
        ) && (
          outcome.includes("yes") ||
          outcome.includes("ja")
        );
      }

      if (!market.includes("total")) return false;

      if (type === "over" && !outcome.includes("over")) return false;
      if (type === "under" && !outcome.includes("under")) return false;

      if (line == null) return true;

      const foundLine = outcome.match(/(\d+(\.\d+)?)/);
      if (!foundLine) return false;

      const oddsLine = Number(foundLine[1]);

      return Math.abs(oddsLine - line) <= 0.35;
    })
    .map((o: any) =>
      Number(o.impliedProb || impliedFromPrice(Number(o.price)))
    )
    .filter((v: number) => v > 0 && v < 1);

  return avg(values);
}

function normalize1x2(match: any) {
  const rows = getRows(match).filter((o: any) =>
    String(o.market || "").toLowerCase().includes("h2h")
  );

  if (!rows.length) return null;

  const homeName = String(match?.homeTeam?.name || "").toLowerCase();
  const awayName = String(match?.awayTeam?.name || "").toLowerCase();

  let home = 0;
  let draw = 0;
  let away = 0;

  for (const row of rows) {
    const outcome = String(row.outcome || "").toLowerCase();
    const implied = Number(row.impliedProb || impliedFromPrice(Number(row.price)));

    if (!implied) continue;

    if (outcome.includes("draw")) {
      draw += implied;
    } else if (homeName && outcome.includes(homeName)) {
      home += implied;
    } else if (awayName && outcome.includes(awayName)) {
      away += implied;
    }
  }

  const total = home + draw + away;
  if (total <= 0) return null;

  return {
    home: home / total,
    draw: draw / total,
    away: away / total,
  };
}

export async function calculateFootballProbabilities(
  match: any,
  ratings?: {
    home?: TeamRating;
    away?: TeamRating;
  },
  elo?: {
    home?: EloTeamRating;
    away?: EloTeamRating;
  }
): Promise<FootballProbabilities> {
  const odds = normalize1x2(match);

  const hasOdds = Boolean(odds);
  const hasForm =
    Boolean(ratings?.home && ratings?.away) &&
    (ratings?.home?.sampleSize || 0) >= 3 &&
    (ratings?.away?.sampleSize || 0) >= 3;

  if (!hasOdds && !hasForm) {
    return {
      homeWin: 0,
      draw: 0,
      awayWin: 0,
      btts: 0,
      over15: 0,
      over25: 0,
      under25: 0,
      under35: 0,
      dataQuality: "LOW",
    };
  }

  const eloProb =
    elo?.home && elo?.away
      ? eloWinProbability(elo.home, elo.away)
      : null;

  let homeWin = odds?.home ?? eloProb?.home ?? 0.45;
  let draw = odds?.draw ?? eloProb?.draw ?? 0.27;
  let awayWin = odds?.away ?? eloProb?.away ?? 0.28;

  if (odds && eloProb) {
    homeWin = odds.home * 0.68 + eloProb.home * 0.32;
    draw = odds.draw * 0.68 + eloProb.draw * 0.32;
    awayWin = odds.away * 0.68 + eloProb.away * 0.32;
  }

  const total1x2 = homeWin + draw + awayWin;
  homeWin /= total1x2;
  draw /= total1x2;
  awayWin /= total1x2;

  
  const xg = estimateExpectedGoals({
    home: advancedForm?.home,
    away: advancedForm?.away,
  });

  const favourite = Math.max(homeWin, awayWin);
  const mismatch = Math.abs(homeWin - awayWin);
  const balance = 1 - mismatch;

  const marketOver25 = marketProbability(match, "over", 2.5);
  const marketUnder25 = marketProbability(match, "under", 2.5);
  const marketOver15 = marketProbability(match, "over", 1.5);
  const marketUnder35 = marketProbability(match, "under", 3.5);
  const marketBtts = marketProbability(match, "btts");

  let over25 =
    marketOver25 != null
      ? marketOver25
      : marketUnder25 != null
        ? 1 - marketUnder25
        : 0.26 + xg.totalXg * 0.11 + (balance - 0.5) * 0.12;

  over25 = clamp(over25 * 100, 24, 76) / 100;

  let under25 =
    marketUnder25 != null
      ? marketUnder25
      : 1 - over25;

  under25 = clamp(under25 * 100, 24, 78) / 100;

  let over15 =
    marketOver15 != null
      ? marketOver15
      : 0.42 + xg.totalXg * 0.11 + favourite * 0.06 - draw * 0.05;

  over15 = clamp(over15 * 100, 48, 88) / 100;

  let under35 =
    marketUnder35 != null
      ? marketUnder35
      : 0.95 - xg.totalXg * 0.12 + draw * 0.04;

  under35 = clamp(under35 * 100, 48, 84) / 100;

  let btts =
    marketBtts != null
      ? marketBtts
      : 0.30 + Math.min(xg.homeXg, xg.awayXg) * 0.18 + over25 * 0.28 + balance * 0.08;

  btts = clamp(btts * 100, 28, 72) / 100;

  const calibratedHome = await calibrateProbability(
    "Sieg Heim",
    homeWin
  );

  const calibratedAway = await calibrateProbability(
    "Sieg Auswärts",
    awayWin
  );

  const calibratedDraw = await calibrateProbability(
    "Remis",
    draw
  );

  const calibratedOver25 = await calibrateProbability(
    "Über 2.5 Tore",
    over25
  );

  const calibratedUnder25 = await calibrateProbability(
    "Unter 2.5 Tore",
    under25
  );

  const calibratedBtts = await calibrateProbability(
    "Beide treffen",
    btts
  );

  return {
    homeWin: pct(calibratedHome, 3, 85),
    draw: pct(calibratedDraw, 8, 38),
    awayWin: pct(calibratedAway, 3, 85),
    btts: pct(calibratedBtts, 28, 72),
    over15: pct(over15, 48, 88),
    over25: pct(calibratedOver25, 24, 76),
    under25: pct(calibratedUnder25, 24, 78),
    under35: pct(under35, 48, 84),
    dataQuality: hasOdds && hasForm && elo?.home?.matches && elo?.away?.matches ? "HIGH" : "MEDIUM",
  };
}
