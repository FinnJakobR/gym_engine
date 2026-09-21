export default function decayScore(days: number): number {
  return days < 7 ? Math.min(0.15, (days - 7) * 0.01) : 0.0;
}
