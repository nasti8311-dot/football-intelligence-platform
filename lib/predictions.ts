import { analyzeNews } from "./news-intelligence";
export type MatchInput = {
  id: string;
  kickoff: Date | null;
  league: string;
  home: string;
  away: string;
  homeGoals: number | null;
  awayGoals: number | null;
};

export type FormGame = {
  opponent: string;
  result: "W" | "D" | "L";
  score: string;
};

export type Prediction = {
  id: string;
  kickoff: Date | null;
  league: string;
  home: string;
  away: string;
  homeXg: number;
  awayXg: number;
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  under25: number;
  bttsYes: number;
  bttsNo: number;
  bestMarket: string;
  bestPick: string;
  bestProbability: number;
  confidence: "High" | "Medium" | "Low";
  valueScore: number;
  reason: string;
  trends: string[];
  injurySignals: string[];
  injuryPenalty: number;
  summary: string;
  homeLast10: FormGame[];
  awayLast10: FormGame[];
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function teamKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/fc|cf|afc|sc|sv|club|football|munchen|muenchen/g, "")
    .replace(/manchester city/g, "city")
    .replace(/fc bayern/g, "bayern")
    .replace(/bayern munich/g, "bayern")
    .replace(/borussia dortmund/g, "dortmund")
    .replace(/bayer leverkusen/g, "leverkusen")
    .replace(/rb leipzig/g, "leipzig")
    .replace(/real madrid/g, "real-madrid")
    .replace(/barcelona/g, "barcelona")
    .replace(/internazionale/g, "inter")
    .replace(/paris saint germain/g, "psg")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fallbackStrength(name: string) {
  const key = teamKey(name);

  const elite = [
    "bayern", "dortmund", "leverkusen", "real-madrid", "barcelona",
    "arsenal", "liverpool", "city", "psg", "inter", "juventus",
  ];

  const strong = [
    "leipzig", "chelsea", "tottenham", "napoli", "roma",
    "atletico", "milan", "newcastle", "aston-villa", "monaco",
  ];

  if (elite.some((x) => key.includes(x))) {
    return { ppg: 2.0, attack: 1.75, defense: 0.95, elo: 1660 };
  }

  if (strong.some((x) => key.includes(x))) {
    return { ppg: 1.6, attack: 1.45, defense: 1.15, elo: 1570 };
  }

  return { ppg: 1.25, attack: 1.2, defense: 1.35, elo: 1500 };
}

function poisson(lambda: number, k: number) {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}

function marketProbabilities(homeXg: number, awayXg: number) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over25 = 0;
  let btts = 0;

  for (let h = 0; h <= 10; h++) {
    for (let a = 0; a <= 10; a++) {
      const p = poisson(homeXg, h) * poisson(awayXg, a);

      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;

      if (h + a >= 3) over25 += p;
      if (h > 0 && a > 0) btts += p;
    }
  }

  return {
    homeWin: homeWin * 100,
    draw: draw * 100,
    awayWin: awayWin * 100,
    over25: over25 * 100,
    under25: 100 - over25 * 100,
    bttsYes: btts * 100,
    bttsNo: 100 - btts * 100,
  };
}

function expectedElo(a: number, b: number) {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}



function buildSummary(
  home: string,
  away: string,
  market: string,
  probability: number,
  trends: string[],
  injurySignals: string[],
  edge?: number | null
) {
  const parts: string[] = [];

  parts.push(`${home} vs ${away}:`);

  if (probability >= 70) {
    parts.push(`starkes Modellvertrauen für ${market}.`);
  } else if (probability >= 60) {
    parts.push(`solider Modellvorteil für ${market}.`);
  } else {
    parts.push(`leichter Modellvorteil für ${market}.`);
  }

  if (edge !== null && edge !== undefined && edge >= 6) {
    parts.push(`Der Markt zeigt zusätzlich eine Value Edge von ${edge.toFixed(1)}%.`);
  }

  if (trends.length) {
    parts.push(`Trend-Signale: ${trends.slice(0, 2).join(", ")}.`);
  }

  if (injurySignals.length) {
    parts.push(`Squad-News: ${injurySignals.slice(0, 2).join(", ")}.`);
  }

  return parts.join(" ");
}


function countRecentOver(gf: number[], ga: number[], line = 2.5) {
  const games = gf.slice(-5).map((g, i) => g + (ga.slice(-5)[i] || 0));
  return games.filter((total) => total > line).length;
}

function countRecentBTTS(gf: number[], ga: number[]) {
  const recentGf = gf.slice(-5);
  const recentGa = ga.slice(-5);
  return recentGf.filter((g, i) => g > 0 && (recentGa[i] || 0) > 0).length;
}

function countRecentWins(points: number[]) {
  return points.slice(-5).filter((p) => p === 3).length;
}

function buildTrends(
  home: string,
  away: string,
  homeXg: number,
  awayXg: number,
  hGf: number[],
  hGa: number[],
  aGf: number[],
  aGa: number[],
  hPts: number[],
  aPts: number[]
) {
  const trends: string[] = [];

  const hOver = countRecentOver(hGf, hGa);
  const aOver = countRecentOver(aGf, aGa);
  const hBtts = countRecentBTTS(hGf, hGa);
  const aBtts = countRecentBTTS(aGf, aGa);
  const hWins = countRecentWins(hPts);
  const aWins = countRecentWins(aPts);

  if (homeXg + awayXg >= 2.75) trends.push(`Hohe Torerwartung: ${(homeXg + awayXg).toFixed(2)} xG`);
  if (homeXg + awayXg <= 2.15) trends.push(`Niedrige Torerwartung: ${(homeXg + awayXg).toFixed(2)} xG`);

  if (hOver >= 4 || aOver >= 4) trends.push(`Over-Trend: ${Math.max(hOver, aOver)}/5 letzte Spiele`);
  if (hBtts >= 4 || aBtts >= 4) trends.push(`BTTS-Trend: ${Math.max(hBtts, aBtts)}/5 letzte Spiele`);

  if (hWins >= 4) trends.push(`${home}: ${hWins}/5 Siege zuletzt`);
  if (aWins >= 4) trends.push(`${away}: ${aWins}/5 Siege zuletzt`);

  if (homeXg >= 2.1) trends.push(`${home} offensiv sehr stark`);
  if (awayXg >= 1.9) trends.push(`${away} offensiv sehr stark`);

  if (homeXg <= 0.9) trends.push(`${home} offensiv schwach`);
  if (awayXg <= 0.9) trends.push(`${away} offensiv schwach`);

  if (homeXg - awayXg >= 0.55) trends.push(`${home} mit klarem xG-Vorteil`);
  if (awayXg - homeXg >= 0.55) trends.push(`${away} mit klarem xG-Vorteil`);

  return trends.slice(0, 4);
}



function extractInjurySignals(news: any[] = []) {
  const badKeywords = [
    "injury",
    "injured",
    "suspended",
    "doubtful",
    "ruled out",
    "out",
    "absence",
    "missing",
    "unavailable"
  ];

  const strongKeywords = [
    "returns",
    "fit again",
    "available",
    "back in training"
  ];

  const signals: string[] = [];
  let penalty = 0;

  for (const item of news.slice(0, 6)) {
    const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();

    for (const kw of badKeywords) {
      if (text.includes(kw)) {
        penalty += 0.04;

        if (signals.length < 4) {
          signals.push(`Injury concern: ${kw}`);
        }
      }
    }

    for (const kw of strongKeywords) {
      if (text.includes(kw)) {
        penalty -= 0.02;

        if (signals.length < 4) {
          signals.push(`Positive squad news`);
        }
      }
    }
  }

  return {
    signals: [...new Set(signals)].slice(0, 4),
    penalty: Math.max(0, Math.min(0.18, penalty)),
  };
}


function mean(values: number[], fallback: number) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : fallback;
}

export function buildPredictions(matches: MatchInput[], now = new Date()) {
  const past = matches
    .filter(
      (m) =>
        m.kickoff &&
        new Date(m.kickoff) < now &&
        m.homeGoals !== null &&
        m.awayGoals !== null
    )
    .sort((a, b) => Number(a.kickoff) - Number(b.kickoff));

  const upcoming = matches
    .filter(
      (m) =>
        m.kickoff &&
        new Date(m.kickoff) > now &&
        (m.homeGoals === null || m.awayGoals === null)
    )
    .sort((a, b) => Number(a.kickoff) - Number(b.kickoff));

  const leagueStats = new Map<string, any>();

  for (const m of past) {
    if (!leagueStats.has(m.league)) {
      leagueStats.set(m.league, {
        matches: 0,
        homeGoals: 0,
        awayGoals: 0,
        totalGoals: 0,
        btts: 0,
        over25: 0,
      });
    }

    const l = leagueStats.get(m.league);
    const hg = Number(m.homeGoals);
    const ag = Number(m.awayGoals);

    l.matches++;
    l.homeGoals += hg;
    l.awayGoals += ag;
    l.totalGoals += hg + ag;
    if (hg > 0 && ag > 0) l.btts++;
    if (hg + ag >= 3) l.over25++;
  }

  function leagueBase(league: string) {
    const l = leagueStats.get(league);
    if (!l || l.matches < 20) {
      return {
        homeGoals: 1.42,
        awayGoals: 1.15,
        avgGoals: 2.57,
        over25: 0.52,
        btts: 0.51,
      };
    }

    return {
      homeGoals: clamp(l.homeGoals / l.matches, 0.9, 2.2),
      awayGoals: clamp(l.awayGoals / l.matches, 0.75, 1.9),
      avgGoals: clamp(l.totalGoals / l.matches, 1.8, 3.8),
      over25: l.over25 / l.matches,
      btts: l.btts / l.matches,
    };
  }

  const elo = new Map<string, number>();
  const stats = new Map<string, any>();
  const form = new Map<string, FormGame[]>();

  function init(team: string) {
    const key = teamKey(team);
    const fallback = fallbackStrength(team);

    if (!elo.has(key)) elo.set(key, fallback.elo);

    if (!stats.has(key)) {
      stats.set(key, {
        played: 0,
        points: 0,
        gf: 0,
        ga: 0,

        homePlayed: 0,
        homeGf: 0,
        homeGa: 0,
        homePoints: 0,

        awayPlayed: 0,
        awayGf: 0,
        awayGa: 0,
        awayPoints: 0,

        weightedPoints: 0,
        weightedGames: 0,

        recentGf: [],
        recentGa: [],
        recentPoints: [],
        recentOpponentElo: [],
        homeWins: 0,
        awayWins: 0,
        homeGames: 0,
        awayGames: 0,
      });
    }

    if (!form.has(key)) form.set(key, []);

    return stats.get(key);
  }

  past.forEach((m, index) => {
    const homeKey = teamKey(m.home);
    const awayKey = teamKey(m.away);

    const h = init(m.home);
    const a = init(m.away);

    const hg = Number(m.homeGoals);
    const ag = Number(m.awayGoals);

    const hResult = hg > ag ? 1 : hg === ag ? 0.5 : 0;
    const aResult = ag > hg ? 1 : ag === hg ? 0.5 : 0;

    const hElo = (elo.get(homeKey) ?? 1500) + 60;
    const aElo = elo.get(awayKey) ?? 1500;

    const hExpected = expectedElo(hElo, aElo);
    const aExpected = expectedElo(aElo, hElo);

    const goalDiff = Math.abs(hg - ag);
    const k = 24 + Math.min(goalDiff, 4) * 5;

    elo.set(homeKey, (elo.get(homeKey) ?? 1500) + k * (hResult - hExpected));
    elo.set(awayKey, (elo.get(awayKey) ?? 1500) + k * (aResult - aExpected));

    const recencyWeight = 0.65 + (index / Math.max(1, past.length)) * 1.35;

    const hPoints = hResult === 1 ? 3 : hResult === 0.5 ? 1 : 0;
    const aPoints = aResult === 1 ? 3 : aResult === 0.5 ? 1 : 0;

    h.played++;
    a.played++;

    h.points += hPoints;
    a.points += aPoints;

    h.gf += hg;
    h.ga += ag;
    a.gf += ag;
    a.ga += hg;

    h.homePlayed++;
    h.homeGf += hg;
    h.homeGa += ag;
    h.homePoints += hPoints;

    a.awayPlayed++;
    a.awayGf += ag;
    a.awayGa += hg;
    a.awayPoints += aPoints;

    h.weightedPoints += hPoints * recencyWeight;
    a.weightedPoints += aPoints * recencyWeight;
    h.weightedGames += recencyWeight;
    a.weightedGames += recencyWeight;

    h.recentGf.push(hg);
    h.recentGa.push(ag);
    h.recentPoints.push(hPoints);
    h.recentOpponentElo.push(aElo);

    a.recentGf.push(ag);
    a.recentGa.push(hg);
    a.recentPoints.push(aPoints);
    a.recentOpponentElo.push(hElo);

    h.recentGf = h.recentGf.slice(-10);
    h.recentGa = h.recentGa.slice(-10);
    h.recentPoints = h.recentPoints.slice(-10);
    h.recentOpponentElo = h.recentOpponentElo.slice(-10);

    a.recentGf = a.recentGf.slice(-10);
    a.recentGa = a.recentGa.slice(-10);
    a.recentPoints = a.recentPoints.slice(-10);
    a.recentOpponentElo = a.recentOpponentElo.slice(-10);

    form.get(homeKey)!.push({
      opponent: m.away,
      result: hg > ag ? "W" : hg < ag ? "L" : "D",
      score: `${hg}:${ag}`,
    });

    form.get(awayKey)!.push({
      opponent: m.home,
      result: ag > hg ? "W" : ag < hg ? "L" : "D",
      score: `${ag}:${hg}`,
    });
  });

  return upcoming.map((m): Prediction => {
    const homeKey = teamKey(m.home);
    const awayKey = teamKey(m.away);

    const h = stats.get(homeKey) || init(m.home);
    const a = stats.get(awayKey) || init(m.away);

    const hf = fallbackStrength(m.home);
    const af = fallbackStrength(m.away);
    const lb = leagueBase(m.league);

    const hPpg = h.played ? h.points / h.played : hf.ppg;
    const aPpg = a.played ? a.points / a.played : af.ppg;

    const hWeightedPpg = h.weightedGames ? h.weightedPoints / h.weightedGames : hPpg;
    const aWeightedPpg = a.weightedGames ? a.weightedPoints / a.weightedGames : aPpg;

    const hHomeAttack = h.homePlayed ? h.homeGf / h.homePlayed : h.played ? h.gf / h.played : hf.attack;
    const hHomeDefense = h.homePlayed ? h.homeGa / h.homePlayed : h.played ? h.ga / h.played : hf.defense;

    const aAwayAttack = a.awayPlayed ? a.awayGf / a.awayPlayed : a.played ? a.gf / a.played : af.attack;
    const aAwayDefense = a.awayPlayed ? a.awayGa / a.awayPlayed : a.played ? a.ga / a.played : af.defense;

    const hRecentAttack10 = mean(h.recentGf, hHomeAttack);
    const hRecentDefense10 = mean(h.recentGa, hHomeDefense);
    const aRecentAttack10 = mean(a.recentGf, aAwayAttack);
    const aRecentDefense10 = mean(a.recentGa, aAwayDefense);

    const hRecentAttack5 = mean(h.recentGf.slice(-5), hRecentAttack10);
    const hRecentDefense5 = mean(h.recentGa.slice(-5), hRecentDefense10);
    const aRecentAttack5 = mean(a.recentGf.slice(-5), aRecentAttack10);
    const aRecentDefense5 = mean(a.recentGa.slice(-5), aRecentDefense10);

    const hAttackBlend = hHomeAttack * 0.45 + hRecentAttack10 * 0.25 + hRecentAttack5 * 0.30;
    const hDefenseBlend = hHomeDefense * 0.45 + hRecentDefense10 * 0.25 + hRecentDefense5 * 0.30;

    const aAttackBlend = aAwayAttack * 0.45 + aRecentAttack10 * 0.25 + aRecentAttack5 * 0.30;
    const aDefenseBlend = aAwayDefense * 0.45 + aRecentDefense10 * 0.25 + aRecentDefense5 * 0.30;

    const hElo = elo.get(homeKey) ?? hf.elo;
    const aElo = elo.get(awayKey) ?? af.elo;

    const hOppElo = mean(h.recentOpponentElo, 1500);
    const aOppElo = mean(a.recentOpponentElo, 1500);

    const hScheduleAdj = clamp((hOppElo - 1500) / 700, -0.18, 0.18);
    const aScheduleAdj = clamp((aOppElo - 1500) / 700, -0.18, 0.18);

    const hRecentPpg5 = mean(h.recentPoints.slice(-5), hWeightedPpg);
    const aRecentPpg5 = mean(a.recentPoints.slice(-5), aWeightedPpg);

    const homeWinRate = h.homePlayed ? h.homeWins / h.homePlayed : 0.5;
    const awayWinRate = a.awayPlayed ? a.awayWins / a.awayPlayed : 0.5;

    const homeTableStrength = clamp((homeWinRate - 0.5) * 1.2, -0.25, 0.35);
    const awayTableStrength = clamp((awayWinRate - 0.5) * 1.2, -0.25, 0.35);

    const eloDiff = clamp((hElo - aElo) / 500, -0.7, 0.7);
    const formEdge = clamp(((hWeightedPpg * 0.55 + hRecentPpg5 * 0.45) - (aWeightedPpg * 0.55 + aRecentPpg5 * 0.45)) / 3, -0.45, 0.45);

    const homeAttackStrength = clamp(hAttackBlend / lb.homeGoals, 0.45, 2.25);
    const awayDefenseWeakness = clamp(aDefenseBlend / lb.homeGoals, 0.45, 2.25);

    const awayAttackStrength = clamp(aAttackBlend / lb.awayGoals, 0.45, 2.25);
    const homeDefenseWeakness = clamp(hDefenseBlend / lb.awayGoals, 0.45, 2.25);

    const injury = extractInjurySignals((m as any).news || []);
    const newsIntel = analyzeNews((m as any).news || []);

    let homeXg = lb.homeGoals *
      Math.pow(homeAttackStrength, 0.66) *
      Math.pow(awayDefenseWeakness, 0.50) *
      (1 + eloDiff * 0.26) *
      (1 + formEdge * 0.20) *
      (1 + homeTableStrength * 0.22) *
      (1 - awayTableStrength * 0.14) *
      (1 + hScheduleAdj * 0.35 - aScheduleAdj * 0.20) *
      (1 - injury.penalty * 0.6) *
      (1 - newsIntel.score * 0.015);

    let awayXg = lb.awayGoals *
      Math.pow(awayAttackStrength, 0.66) *
      Math.pow(homeDefenseWeakness, 0.50) *
      (1 - eloDiff * 0.24) *
      (1 - formEdge * 0.17) *
      (1 + awayTableStrength * 0.22) *
      (1 - homeTableStrength * 0.14) *
      (1 + aScheduleAdj * 0.35 - hScheduleAdj * 0.20) *
      (1 - injury.penalty * 0.45) *
      (1 - newsIntel.score * 0.012);

    homeXg = clamp(homeXg, 0.25, 3.4);
    awayXg = clamp(awayXg, 0.20, 3.1);

    const mk = marketProbabilities(homeXg, awayXg);

    const options = [
      { market: "Sieg Heim", pick: m.home, prob: mk.homeWin },
      { market: "Unentschieden", pick: "X", prob: mk.draw },
      { market: "Sieg Auswärts", pick: m.away, prob: mk.awayWin },
      { market: "Über 2.5 Tore", pick: "Over 2.5", prob: mk.over25 },
      { market: "Unter 2.5 Tore", pick: "Under 2.5", prob: mk.under25 },
      { market: "Beide treffen", pick: "BTTS Yes", prob: mk.bttsYes },
      { market: "Beide treffen nicht", pick: "BTTS No", prob: mk.bttsNo },
    ];

    const best = options.sort((x, y) => y.prob - x.prob)[0];

    const hData = clamp(h.played / 12, 0.45, 1);
    const aData = clamp(a.played / 12, 0.45, 1);
    const dataQuality = hData * aData;

    const marketPenalty =
      best.market === "Unentschieden"
        ? 0.72
        : best.market.includes("Sieg")
        ? 1
        : 1.04;

    let marketOdds = null;
    let impliedProbability = null;
    let bestEdge = 0;

    if ((m as any).odds && (m as any).odds.length > 0) {
      const mapped = (m as any).odds.find((o: any) => {
        if (best.market === "Sieg Heim") {
          return o.market === "h2h" && o.outcome === m.home;
        }

        if (best.market === "Sieg Auswärts") {
          return o.market === "h2h" && o.outcome === m.away;
        }

        if (best.market === "Unentschieden") {
          return o.market === "h2h" &&
            (o.outcome === "Draw" || o.outcome === "Unentschieden");
        }

        if (best.market === "Über 2.5 Tore") {
          return o.market === "totals" &&
            o.outcome.toLowerCase().includes("over");
        }

        if (best.market === "Unter 2.5 Tore") {
          return o.market === "totals" &&
            o.outcome.toLowerCase().includes("under");
        }

        return false;
      });

      if (mapped?.price) {
        marketOdds = mapped.price;
        impliedProbability = 100 / mapped.price;
        bestEdge = best.prob - impliedProbability;
      }
    }

    const probabilityEdge = Math.max(0, best.prob - 50);
    const xgEdge = Math.abs(homeXg - awayXg) * 10;
    const totalGoalsSignal = Math.abs(homeXg + awayXg - 2.5) * 8;
    const edgeBonus = Math.max(0, bestEdge) * 1.35;
    const dataBonus = dataQuality >= 0.85 ? 3 : dataQuality >= 0.65 ? 1 : -2;

    const valueScore = Math.round(
      (probabilityEdge +
        xgEdge +
        totalGoalsSignal +
        edgeBonus +
        dataBonus) *
        dataQuality *
        marketPenalty
    );

    const confidence =
      best.prob >= 68 && valueScore >= 18 && dataQuality >= 0.75
        ? "High"
        : best.prob >= 58 && valueScore >= 9
        ? "Medium"
        : "Low";

    const reason =
      `${m.home} xG ${homeXg.toFixed(2)} vs ${m.away} xG ${awayXg.toFixed(2)}. ` +
      `Modell nutzt Liga-Schnitt, Heim/Auswärtswerte, letzte 5/10 Spiele, Elo, Gegnerstärke, Form und Marktvergleich. ` +
      `Stärkster Markt: ${best.market}. ` +
      (bestEdge > 0
        ? `Value Edge: ${bestEdge.toFixed(1)}%.`
        : `Kein klarer Marktfehler erkannt.`);

    return {
      id: m.id,
      kickoff: m.kickoff,
      league: m.league,
      home: m.home,
      away: m.away,
      homeXg,
      awayXg,
      homeWin: mk.homeWin,
      draw: mk.draw,
      awayWin: mk.awayWin,
      over25: mk.over25,
      under25: mk.under25,
      bttsYes: mk.bttsYes,
      bttsNo: mk.bttsNo,
      bestMarket: best.market,
      bestPick: best.pick,
      bestProbability: best.prob,
      confidence,
      valueScore,
      reason,
      injurySignals: injury.signals,
      injuryPenalty: injury.penalty,
      summary: buildSummary(
        m.home,
        m.away,
        best.market,
        bestProbability,
        buildTrends(
          m.home,
          m.away,
          homeXg,
          awayXg,
          h.recentGf,
          h.recentGa,
          a.recentGf,
          a.recentGa,
          h.recentPoints,
          a.recentPoints
        ),
        injury.signals,
        bestEdge
      ),
      trends: buildTrends(
        m.home,
        m.away,
        homeXg,
        awayXg,
        h.recentGf,
        h.recentGa,
        a.recentGf,
        a.recentGa,
        h.recentPoints,
        a.recentPoints
      ),
      homeLast10: (form.get(homeKey) || []).slice(-10).reverse(),
      awayLast10: (form.get(awayKey) || []).slice(-10).reverse(),
    };
  });
}

export function topDailyPicks(predictions: Prediction[], limit = 10) {
  return predictions
    .filter((p) => p.confidence !== "Low")
    .sort((a, b) => {
      if (b.valueScore !== a.valueScore) return b.valueScore - a.valueScore;
      return b.bestProbability - a.bestProbability;
    })
    .slice(0, limit);
}
