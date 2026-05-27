const marketMemory: Record<string, number[]> = {};

export function rememberMarketResult(
  market: string,
  hit: boolean
) {
  if (!marketMemory[market]) {
    marketMemory[market] = [];
  }

  marketMemory[market].push(hit ? 1 : 0);

  if (marketMemory[market].length > 200) {
    marketMemory[market].shift();
  }
}

export function marketHitRate(market: string) {
  const arr = marketMemory[market] || [];

  if (!arr.length) return 50;

  return Number(
    (
      (arr.reduce((a, b) => a + b, 0) / arr.length) *
      100
    ).toFixed(2)
  );
}
