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

function impliedFairOdds(probability: number) {
  return probability > 0 ? 100 / probability : 99;
}

function valueScore(probability: number, market: string) {
  const fairOdds = impliedFairOdds(probability);

  const marketBonus =
    market === "Heimsieg" ? 7 :
    market === "Auswärtssieg" ? 8 :
    market === "Beide Teams treffen" ? 5 :
    market === "Über 2,5 Tore" ? 5 :
    market === "Über 1,5 Tore" ? -16 :
    market === "Unter 3,5 Tore" ? -14 :
    0;

  const priceValue =
    fairOdds >= 1.35 && fairOdds <= 2.40 ? 8 :
    fairOdds >= 1.25 && fairOdds <= 3.00 ? 5 :
    fairOdds < 1.20 ? -12 :
    fairOdds > 3.50 ? -10 :
    0;

  return marketBonus + priceValue;
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
    .filter((o) => o.probability >= 35)
    .map((o) => {
      const value = valueScore(o.probability, o.market);

      return {
        ...o,
        value,
        score: o.probability + value,
      };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0];
}
