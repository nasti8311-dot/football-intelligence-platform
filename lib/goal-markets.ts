function factorial(n: number) {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poisson(lambda: number, k: number) {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

function pct(x: number) {
  return Math.max(1, Math.min(99, Number((x * 100).toFixed(2))));
}

export function calculateGoalMarkets(homeXg: number, awayXg: number) {
  const maxGoals = 10;
  let over15 = 0;
  let over25 = 0;
  let under35 = 0;
  let btts = 0;

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = poisson(homeXg, h) * poisson(awayXg, a);
      const total = h + a;

      if (total >= 2) over15 += p;
      if (total >= 3) over25 += p;
      if (total <= 3) under35 += p;
      if (h >= 1 && a >= 1) btts += p;
    }
  }

  return {
    over15: pct(over15),
    over25: pct(over25),
    under35: pct(under35),
    btts: pct(btts),
  };
}
