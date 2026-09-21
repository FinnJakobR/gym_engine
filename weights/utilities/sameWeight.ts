export default function isSameWeight(weights: number[]): boolean {
  let w = weights[0];

  for (let i = 1; i < weights.length; i++) {
    if (weights[i] != w) return false;
  }

  return true;
}
