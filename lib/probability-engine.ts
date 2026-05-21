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

function marketProbability(match: any, marketNeedle: string, outcomeNeedles: string[]) {
  const rows = Array.isArray(match?.bookmakerOdds) ? match.bookmakerOdds : [];

  const values = rows
    .filter((o: any) =>
      String(o.market || "").toLowerCase().includes(marketNeedle.toLowerCase())
    )
    .filter((o: any) => {
      const outcome = String(o.outcome || "").toLowerCase();
      return outcomeNeedles.some((needle) => outcome.includes(needle.toLowerCase()));
    })
    .map((o: any) => Number(o.impliedProb || impliedFromPrice(Number(o.price))))
    .filter((v: number) => v > 0 && v < 1);

  return avg(values);
}

function normalizeOdds(match: any) {
  if (Array.isArray(match?.odds) && match.odds.length > 0) {
    const row = match.odds.find(
      (o: any) => o.homeOdds && o.drawOdds && o.awayOdds
    );

    if (row) {
      const h = 1 / Number(row.homeOdds);
      const d = 1 / Number(row.drawOdds);
      const a = 1 / Number(row.awayOdds);
      const total = h + d + a;

      return {
        home: h / total,
        draw: d / total,
        away: a / total,
      };
    }
  }

  const rows = Array.isArray(match?.bookmakerOdds) ? match.bookmakerOdds : [];
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
    const implied = Number(odd.impliedProb || impliedFromPrice(Number(odd.price)));

    if (!implied || implied <= 0) continue;

    if (outcome === "draw" || outcome === "x" || outcome.includes("draw")) {
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

  for (let h = 0; h <= 12; h++) {
    for (let a = 0; a <= 12; a++) {
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

  return { homeWin, draw, awayWin, btts, over15, over25, under25, under35 };
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

  const hasOdds = Boolean(odds);

  if (!hasOdds && !hasEnoughFormData) {
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

  let homeXg = 1.35;
  let awayXg = 1.1;

  if (hasEnoughFormData && home && away) {
    homeXg =
      1.35 *
      home.attack *
      (1 / Math.max(0.75, away.defense)) *
      home.homeAdvantage *
      (1 + home.form * 0.1);

    awayXg =
      1.1 *
      away.attack *
      (1 / Math.max(0.75, home.defense)) *
      (1 + away.form * 0.08);
  }

  homeXg = Math.min(3.2, Math.max(0.55, homeXg));
  awayXg = Math.min(3.0, Math.max(0.45, awayXg));

  const model = scoreMatrix(homeXg, awayXg);

  const totalModel = model.homeWin + model.draw + model.awayWin;

  let homeWin = model.homeWin / totalModel;
  let draw = model.draw / totalModel;
  let awayWin = model.awayWin / totalModel;

  if (odds) {
    const oddsWeight = hasEnoughFormData ? 0.7 : 0.9;

    homeWin = homeWin * (1 - oddsWeight) + odds.home * oddsWeight;
    draw = draw * (1 - oddsWeight) + odds.draw * oddsWeight;
    awayWin = awayWin * (1 - oddsWeight) + odds.away * oddsWeight;
  }

  const total1x2 = homeWin + draw + awayWin;

  homeWin /= total1x2;
  draw /= total1x2;
  awayWin /= total1x2;

  const marketBtts =
    marketProbability(match, "btts", ["yes", "ja"]) ??
    marketProbability(match, "both", ["yes", "ja"]);

  const marketOver15 =
    marketProbability(match, "totals", ["over 1.5", "over1.5", "over"]) ??
    null;

  const marketOver25 =
    marketProbability(match, "totals", ["over 2.5", "over2.5"]) ??
    marketProbability(match, "over/under", ["over 2.5"]);

  const marketUnder25 =
    marketProbability(match, "totals", ["under 2.5", "under2.5"]) ??
    marketProbability(match, "over/under", ["under 2.5"]);

  const marketUnder35 =
    marketProbability(match, "totals", ["under 3.5", "under3.5"]) ??
    marketProbability(match, "over/under", ["under 3.5"]);

  const btts = marketBtts != null ? pct(marketBtts, 20, 80) : pct(model.btts, 20, 80);
  const over15 = marketOver15 != null ? pct(marketOver15, 25, 92) : pct(model.over15, 25, 92);
  const over25 = marketOver25 != null ? pct(marketOver25, 15, 82) : pct(model.over25, 15, 82);
  const under25 = marketUnder25 != null ? pct(marketUnder25, 18, 85) : pct(model.under25, 18, 85);
  const under35 = marketUnder35 != null ? pct(marketUnder35, 30, 79) : pct(model.under35, 30, 79);

  return {
    homeWin: pct(homeWin, 3, 85),
    draw: pct(draw, 8, 38),
    awayWin: pct(awayWin, 3, 85),
    btts,
    over15,
    over25,
    under25,
    under35,
    dataQuality: hasOdds && hasEnoughFormData ? "HIGH" : "MEDIUM",
  };
}
