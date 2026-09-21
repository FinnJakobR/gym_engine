// Manuell gesetzte Gewichte für Phase 1

const WEIGHTS = {
  primaryMuscle: 3.5, // Zielmuskel MUSS erholt sein
  synergist: 1.5, // Hilfsmuskel sollte erholt sein
  staleness: -2.0, // Strafe für Abnutzung/Oft genutzt
  performance: 1.0, // Positiver Trend gibt Bonus ("Ride the wave")
  machineRecovery: 1.0, // Bonus, wenn Maschine lange nicht genutzt wurde
  antagonist: 0.5, // Leichter Bonus für gegengleiche Frische
};

export default function linearScore(vector: number[]): number {
  const [
    normPerformance,
    normStaleness,
    normAntagonist,
    normPrimary,
    normSynergist,
    normMachine,
  ] = vector;

  const score =
    normPrimary * WEIGHTS.primaryMuscle +
    normSynergist * WEIGHTS.synergist +
    normStaleness * WEIGHTS.staleness +
    normPerformance * WEIGHTS.performance +
    normMachine * WEIGHTS.machineRecovery +
    normAntagonist * WEIGHTS.antagonist;

  return score; // Z.B. ein Wert zwischen -1.0 und +7.5
}
