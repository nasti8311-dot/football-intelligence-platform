export type MatchInput = {
  id: string;
  kickoff: Date | null;
  league: string;
  home: string;
  away: string;
  homeGoals: number | null;
  awayGoals: number | null;
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
  homeLast10: FormGame[];
  awayLast10: FormGame[];
};

export type FormGame = {
  opponent: string;
  result: "W" | "D" | "L";
  score: string;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function teamKey(name: string) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
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
    "bayern",
    "dortmund",
    "leverkusen",
    "real-madrid",
    "barcelona",
    "arsenal",
    "liverpool",
    "city",
    "psg",
    "inter",
    "juventus",
  ];

  const strong = [
    "leipzig",
    "chelsea",
    "tottenham",
    "napoli",
    "roma",
    "atletico",
    "milan",
    "newcastle",
    "aston-villa",
  ];

  if (elite.some((x) => key.includes(x))) {
    return { ppg: 2.0, attack: 1.9, defense: 0.9, elo: 1660 };
  }

  if (strong.some((x) => key.includes(x))) {
    return { ppg: 1.65, attack: 1.55, defense: 1.15, elo: 1570 };
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
        awayPlayed: 0,
        awayGf: 0,
        awayGa: 0,
        weightedPoints: 0,
        weightedGames: 0,
      });
    }

    if (!form.has(key)) form.set(key, []);

    return stats.get(key);
  }

  past.forEach((m, index) => {
    const home = m.home;
    const away = m.away;
    const homeKey = teamKey(home);
    const awayKey = teamKey(away);

    const h = init(home);
    const a = init(away);

    const hg = Number(m.homeGoals ?? 0);
    const ag = Number(m.awayGoals ?? 0);

    const hResult = hg > ag ? 1 : hg === ag ? 0.5 : 0;
    const aResult = ag > hg ? 1 : ag === hg ? 0.5 : 0;

    const hElo = (elo.get(homeKey) ?? 1500) + 55;
    const aElo = elo.get(awayKey) ?? 1500;

    const hExpected = expectedElo(hElo, aElo);
    const aExpected = expectedElo(aElo, hElo);

    const goalDiff = Math.abs(hg - ag);
    const k = 26 + Math.min(goalDiff, 4) * 4;

    elo.set(homeKey, (elo.get(homeKey) ?? 1500) + k * (hResult - hExpected));
    elo.set(awayKey, (elo.get(awayKey) ?? 1500) + k * (aResult - aExpected));

    const recencyWeight = 1 + index / Math.max(1, past.length);

    h.played++;
    a.played++;

    h.gf += hg;
    h.ga += ag;
    a.gf += ag;
    a.ga += hg;

    h.homePlayed++;
    h.homeGf += hg;
    h.homeGa += ag;

    a.awayPlayed++;
    a.awayGf += ag;
    a.awayGa += hg;

    const hPoints = hResult === 1 ? 3 : hResult === 0.5 ? 1 : 0;
    const aPoints = aResult === 1 ? 3 : aResult === 0.5 ? 1 : 0;

    h.points += hPoints;
    a.points += aPoints;

    h.weightedPoints += hPoints * recencyWeight;
    a.weightedPoints += aPoints * recencyWeight;
    h.weightedGames += recencyWeight;
    a.weightedGames += recencyWeight;

    form.get(homeKey)!.push({
      opponent: away,
      result: hg > ag ? "W" : hg < ag ? "L" : "D",
      score: `${hg}:${ag}`,
    });

    form.get(awayKey)!.push({
      opponent: home,
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

    const hPpg = h.played ? h.points / h.played : hf.ppg;
    const aPpg = a.played ? a.points / a.played : af.ppg;

    const hWeightedPpg = h.weightedGames ? h.weightedPoints / h.weightedGames : hPpg;
    const aWeightedPpg = a.weightedGames ? a.weightedPoints / a.weightedGames : aPpg;

    const hAttack = h.homePlayed ? h.homeGf / h.homePlayed : h.played ? h.gf / h.played : hf.attack;
    const aAttack = a.awayPlayed ? a.awayGf / a.awayPlayed : a.played ? a.gf / a.played : af.attack;

    const hDefense = h.homePlayed ? h.homeGa / h.homePlayed : h.played ? h.ga / h.played : hf.defense;
    const aDefense = a.awayPlayed ? a.awayGa / a.awayPlayed : a.played ? a.ga / a.played : af.defense;

    const hElo = elo.get(homeKey) ?? hf.elo;
    const aElo = elo.get(awayKey) ?? af.elo;

    const eloDiff = clamp((hElo - aElo) / 450, -0.65, 0.65);

    const homeXg = clamp(
      1.18 +
        hAttack * 0.42 -
        aDefense * 0.24 +
        hWeightedPpg * 0.14 +
        eloDiff * 0.45 +
        0.18,
      0.35,
      3.4
    );

    const awayXg = clamp(
      1.02 +
        aAttack * 0.42 -
        hDefense * 0.24 +
        aWeightedPpg * 0.14 -
        eloDiff * 0.38,
      0.25,
      3.2
    );

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

    const dataQuality =
      (h.played >= 8 ? 1 : 0.7) *
      (a.played >= 8 ? 1 : 0.7);

    const valueScore = Math.round((best.prob - 45) * dataQuality + Math.abs(homeXg - awayXg) * 7);

    const confidence =
      best.prob >= 64 && valueScore >= 18
        ? "High"
        : best.prob >= 56 && valueScore >= 10
        ? "Medium"
        : "Low";

    const reason =
      `${m.home} xG ${homeXg.toFixed(2)} vs ${m.away} xG ${awayXg.toFixed(2)}. ` +
      `Elo/Form und Heim-Auswärtsprofil sprechen am stärksten für ${best.market}.`;

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
