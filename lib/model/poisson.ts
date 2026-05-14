export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new Error("Factorial expects a non-negative integer.");
  return n <= 1 ? 1 : Array.from({ length: n }, (_, index) => index + 1).reduce((a, b) => a * b, 1);
}

export function poissonProbability(lambda: number, goals: number): number {
  if (lambda <= 0) throw new Error("Lambda must be positive.");
  if (!Number.isInteger(goals) || goals < 0) throw new Error("Goals must be a non-negative integer.");
  return (Math.exp(-lambda) * Math.pow(lambda, goals)) / factorial(goals);
}
