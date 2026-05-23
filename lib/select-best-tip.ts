type BestTipInput = {
  homeWin: number;
  draw: number;
  awayWin: number;
  over25: number;
  bttsYes: number;
  over15: number;
  under35: number;
};

export function selectBestTip(input: BestTipInput) {
  const options = [
    {
      market: "Heimsieg",
      pick: "Heimsieg",
      probability: input.homeWin,
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

  return options.sort((a, b) => b.probability - a.probability)[0];
}
