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
  const probabilityBand =
    probability >= 55 && probability <= 78 ? 10 :
    probability > 78 && probability <= 88 ? 2 :
    probability > 88 ? -14 :
    probability >= 45 ? 2 :
    -12;

  const marketBonus =
    market === "Heimsieg" ? 9 :
    market === "Auswärtssieg" ? 10 :
    market === "Unentschieden" ? -14 :
    market === "Beide Teams treffen" ? 7 :
    market === "Über 2,5 Tore" ? 8 :
    market === "Über 1,5 Tore" ? -12 :
    market === "Unter 3,5 Tore" ? -10 :
    0;

  return probabilityBand + marketBonus;
}

export function selectBestTip(input: BestTipInput) {
  const options: Omit<TipOption, "value" | "score">[] = [
    { market: "Heimsieg", pick: "Heimsieg", probability: input.homeWin },
    { market: "Unentschieden", pick: "Unentschieden", probability: input.draw },
    { market: "Auswärtssieg", pick: "Auswärtssieg", probability: input.awayWin },
    { market: "Beide Teams treffen", pick: "Ja", probability: input.bttsYes },
    { market: "Über 2,5 Tore", pick: "Über 2,5", probability: input.over25 },
    { market: "Über 1,5 Tore", pick: "Über 1,5", probability: input.over15 },
    { market: "Unter 3,5 Tore", pick: "Unter 3,5", probability: input.under35 },
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

  const best = ranked[0];

  if (best.market === "Über 1,5 Tore" || best.market === "Unter 3,5 Tore") {
    const alternative = ranked.find(
      (o) =>
        o.market !== "Über 1,5 Tore" &&
        o.market !== "Unter 3,5 Tore" &&
        o.score >= best.score - 6
    );

    return alternative || best;
  }

  return best;
}
