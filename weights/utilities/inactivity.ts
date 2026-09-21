export default function inactivityScore(weight: number): number {
  return Math.max(7, 14 - weight * 0.02);
}
