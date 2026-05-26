export function poisson(lambda: number, k: number) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export function calculateMatchProbabilities(homeXg: number, awayXg: number) {
  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  let over15 = 0;
  let over25 = 0;
  let under35 = 0;
  let btts = 0;

  for (let h = 0; h <= 7; h++) {
    for (let a = 0; a <= 7; a++) {
      const p =
        poisson(homeXg, h) *
        poisson(awayXg, a);

      if (h > a) homeWin += p;
      if (h === a) draw += p;
      if (a > h) awayWin += p;

      if (h + a >= 2) over15 += p;
      if (h + a >= 3) over25 += p;
      if (h + a <= 3) under35 += p;

      if (h >= 1 && a >= 1) btts += p;
    }
  }

  return {
    homeWin: homeWin * 100,
    draw: draw * 100,
    awayWin: awayWin * 100,
    over15: over15 * 100,
    over25: over25 * 100,
    under35: under35 * 100,
    btts: btts * 100,
  };
}
