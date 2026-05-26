export function chooseBestPick(p: any) {
  const options = [
    {
      market: "Heimsieg",
      pick: "Heimsieg",
      probability: p.homeWin,
      risk: 1.0,
    },
    {
      market: "Über 1,5 Tore",
      pick: "Über 1,5",
      probability: p.over15,
      risk: 0.72,
    },
    {
      market: "Über 2,5 Tore",
      pick: "Über 2,5",
      probability: p.over25,
      risk: 1.0,
    },
    {
      market: "Unter 3,5 Tore",
      pick: "Unter 3,5",
      probability: p.under35,
      risk: 0.88,
    },
    {
      market: "Beide Teams treffen",
      pick: "Ja",
      probability: p.btts,
      risk: 0.95,
    },
  ];

  const scored = options.map((o) => ({
    ...o,
    score: o.probability * o.risk,
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored[0];
}
