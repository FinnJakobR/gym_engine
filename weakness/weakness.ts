export function E1RM(weight: number, reps: number): number {
  return weight * (1 + reps / 30.0);
}

//bilde eine lineareRegression um einen Trend über die E1RM zu erkennen
export function linearRegression(e1rm_history: number[]): number {
  if (e1rm_history.length < 2) return 1.0;

  const n = e1rm_history.length;

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += e1rm_history[i];
    sumXY += i * e1rm_history[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope; // Positiv = Fortschritt, Negativ = Regression, 0 = Plateau
}
