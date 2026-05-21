import type { TeamRating } from "@/lib/team-rating-engine";

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

function factorial(n: number) {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poisson(lambda: number, goals: number) {
  return (Math.exp(-lambda) * Math.pow(lambda, goals)) / factorial(goals);
}

function impliedFromPrice(price: number) {
  return price > 1 ? 1 / price : 0;
}

function avg(values: number[]) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function marketProbability(
  match: any,
  type: "over" | "under" | "btts",
  line?: number
) {
  const rows = Array.isArray(match?.bookmakerOdds)
    ? match.bookmakerOdds
    : [];

  const values = rows
    .filter((o: any) => {
      const market = String(o.market || "").toLowerCase();
      const outcome = String(o.outcome || "").toLowerCase();

      if (type === "btts") {
        return market.includes("btts") || market.includes("both");
      }

      if (!market.includes("total")) return false;

      if (type === "over" && !outcome.includes("over")) {
        return false;
      }

      if (type === "under" && !outcome.includes("under")) {
        return false;
      }

      if (line == null) return true;

      const m = outcome.match(/(\d+(\.\d+)?)/);

      if (!m) return false;

      const oddLine = Number(m[1]);

      return Math.abs(oddLine - line) <= 0.3;
    })
    .map((o: any) =>
      Number(
        o.impliedProb ||
        (o.price > 1 ? 1 / Number(o.price) : 0)
      )
    )
    .filter((v: number) => v > 0 && v < 1);

  return avg(values);
}

function normalizeOdds(match: any) {
  const rows = Array.isArray(match?.bookmakerOdds)
    ? match.bookmakerOdds
    : [];

  const h2h = rows.filter((o: any) =>
    String(o.market || "").toLowerCase().includes("h2h")
  );

  if (!h2h.length) return null;

  const homeName = String(match?.homeTeam?.name || "").toLowerCase();
  const awayName = String(match?.awayTeam?.name || "").toLowerCase();

  let home = 0;
  let draw = 0;
  let away = 0;

  for (const odd of h2h) {
    const outcome = String(odd.outcome || "").toLowerCase();

    const implied = Number(
      odd.impliedProb ||
      impliedFromPrice(Number(odd.price))
    );

    if (!implied || implied <= 0) continue;

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

function scoreMatrix(homeXg: number, awayXg: number) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let btts = 0;
  let over15 = 0;
  let over25 = 0;
  let under25 = 0;
  let under35 = 0;

  for (let h = 0; h <= 10; h++) {
    for (let a = 0; a <= 10; a++) {
      const p = poisson(homeXg, h) * poisson(awayXg, a);
      const goals = h + a;

      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;

      if (h > 0 && a > 0) btts += p;
      if (goals >= 2) over15 += p;
      if (goals >= 3) over25 += p;
      if (goals <= 2) under25 += p;
      if (goals <= 3) under35 += p;
    }
  }

  return {
    homeWin,
    draw,
    awayWin,
    btts,
    over15,
    over25,
    under25,
    under35,
  };
}

export function calculateFootballProbabilities(
  match: any,
  ratings?: {
    home?: TeamRating;
    away?: TeamRating;
  }
): FootballProbabilities {
  const odds = normalizeOdds(match);

  const home = ratings?.home;
  const away = ratings?.away;

  const hasEnoughFormData =
    Boolean(home && away) &&
    (home?.sampleSize || 0) >= 3 &&
    (away?.sampleSize || 0) >= 3;

  if (!odds && !hasEnoughFormData) {
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

  let homeXg = 1.2;
  let awayXg = 1.0;

  if (hasEnoughFormData && home && away) {
    const attackDiff =
      (home.attack - away.defense) * 0.9;

    const awayAttackDiff =
      (away.attack - home.defense) * 0.75;

    const formBoost =
      (home.form - away.form) * 0.45;

    const totalStrength =
      home.attack +
      away.attack +
      (2 - home.defense) +
      (2 - away.defense);

    homeXg =
      1.15 +
      attackDiff +
      formBoost +
      (home.homeAdvantage - 1) * 0.4;

    awayXg =
      0.95 +
      awayAttackDiff -
      formBoost * 0.35;

    if (totalStrength > 4.8) {
      homeXg += 0.25;
      awayXg += 0.2;
    }

    if (totalStrength < 3.4) {
      homeXg -= 0.18;
      awayXg -= 0.15;
    }
  }

  homeXg = Math.min(3.8, Math.max(0.35, homeXg));
  awayXg = Math.min(3.4, Math.max(0.25, awayXg));

  const model = scoreMatrix(homeXg, awayXg);

  let homeWin = model.homeWin;
  let draw = model.draw;
  let awayWin = model.awayWin;

  const total1x2 = homeWin + draw + awayWin;

  homeWin /= total1x2;
  draw /= total1x2;
  awayWin /= total1x2;

  if (odds) {
    homeWin = homeWin * 0.3 + odds.home * 0.7;
    draw = draw * 0.3 + odds.draw * 0.7;
    awayWin = awayWin * 0.3 + odds.away * 0.7;
  }

  const marketBtts = marketProbability(match, "btts");

  const marketOver15 = marketProbability(match, "over", 1.5);
  const marketOver25 = marketProbability(match, "over", 2.5);

  const marketUnder25 = marketProbability(match, "under", 2.5);
  const marketUnder35 = marketProbability(match, "under", 3.5);

  return {
    homeWin: pct(homeWin, 3, 85),
    draw: pct(draw, 8, 38),
    awayWin: pct(awayWin, 3, 85),

    btts:
      marketBtts != null
        ? pct(marketBtts, 18, 82)
        : pct(model.btts, 18, 82),

    over15:
      marketOver15 != null
        ? pct(marketOver15, 25, 92)
        : pct(model.over15, 25, 92),

    over25:
      marketOver25 != null
        ? pct(marketOver25, 15, 82)
        : pct(model.over25, 15, 82),

    under25:
      marketUnder25 != null
        ? pct(marketUnder25, 18, 85)
        : pct(model.under25, 18, 85),

    under35:
      marketUnder35 != null
        ? pct(marketUnder35, 25, 79)
        : pct(model.under35, 25, 79),

    dataQuality:
      odds && hasEnoughFormData ? "HIGH" : "MEDIUM",
  };
}
