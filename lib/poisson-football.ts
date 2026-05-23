function poisson(lambda: number, k: number) {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

function factorial(n: number) {
  if (n <= 1) return 1;
  let out = 1;
  for (let i = 2; i <= n; i++) out *= i;
  return out;
}

function pct(v: number) {
  return Math.max(1, Math.min(99, Number((v * 100).toFixed(2))));
}

export function calculatePoissonMarkets(homeXg: number, awayXg: number) {
  const maxGoals = 10;

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;
  let over15 = 0;
  let over25 = 0;
  let under35 = 0;
  let btts = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = poisson(homeXg, h) * poisson(awayXg, a);
      const total = h + a;

      if (h > a) homeWin += p;
      if (h === a) draw += p;
      if (a > h) awayWin += p;

      if (total > 1.5) over15 += p;
      if (total > 2.5) over25 += p;
      if (total < 3.5) under35 += p;
      if (h > 0 && a > 0) btts += p;
    }
  }

  return {
    homeWin: pct(homeWin),
    draw: pct(draw),
    awayWin: pct(awayWin),
    over15: pct(over15),
    over25: pct(over25),
    under35: pct(under35),
    bttsYes: pct(btts),
    bttsNo: pct(1 - btts),
  };
}
