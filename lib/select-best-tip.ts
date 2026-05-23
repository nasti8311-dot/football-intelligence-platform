type BestTipInput = {
  homeWin: number;
  draw: number;
  awayWin: number;
  over15: number;
  over25: number;
  under35: number;
  bttsYes: number;
};

type TipOption = {
  market: string;
  pick: string;
  probability: number;
  value: number;
  score: number;
};

function marketValue(market: string, probability: number) {
  const balancedProbabilityBonus =
    probability >= 55 && probability <= 78 ? 8 :
    probability > 78 && probability <= 88 ? 3 :
    probability > 88 ? -8 :
    probability >= 45 ? 2 :
    -10;

  const marketBonus =
    market === "Heimsieg" ? 6 :
    market === "Auswärtssieg" ? 7 :
    market === "Unentschieden" ? -10 :
    market === "Beide Teams treffen" ? 5 :
    market === "Über 2,5 Tore" ? 5 :
    market === "Über 1,5 Tore" ? -3 :
    market === "Unter 3,5 Tore" ? -3 :
    0;

  return balancedProbabilityBonus + marketBonus;
}

export function selectBestTip(input: BestTipInput) {
  const options: Omit<TipOption, "value" | "score">[] = [
    {
      market: "Heimsieg",
      pick: "Heimsieg",
      probability: input.homeWin,
    },
    {
      market: "Unentschieden",
      pick: "Unentschieden",
      probability: input.draw,
    },
    {
      market: "Auswärtssieg",
      pick: "Auswärtssieg",
      probability: input.awayWin,
    },
    {
      market: "Beide Teams treffen",
      pick: "Ja",
      probability: input.bttsYes,
    },
    {
      market: "Über 2,5 Tore",
      pick: "Über 2,5",
      probability: input.over25,
    },
    {
      market: "Über 1,5 Tore",
      pick: "Über 1,5",
      probability: input.over15,
    },
    {
      market: "Unter 3,5 Tore",
      pick: "Unter 3,5",
      probability: input.under35,
    },
  ];

  const ranked: TipOption[] = options
    .filter((o) => o.probability >= 40)
    .map((o) => {
      const value = marketValue(o.market, o.probability);

      return {
        ...o,
        value,
        score: o.probability + value,
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0];
}
