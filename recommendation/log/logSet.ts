import Database from "../../db/db";
import { E1RM } from "../../weakness/weakness";

export function logCompletedSet(
  conn: Database,
  machineId: number,
  features: number[],
  calculatedScore: number,
  weight: number,
  reps: number,
  rir: number,
  set: number,
  ex_id: number,
) {
  // Letzten e1RM-Bestwert dieser Maschine aus der DB holen

  const prevMaxE1RM = conn.getPreviousMaxE1RM(machineId) || E1RM(weight, reps);

  // Aktuellen e1RM berechnen
  const currentE1RM = E1RM(weight, reps);

  // Delta berechnen (z.B. +0.03 = 3% Steigerung, -0.02 = 2% Leistungseinbruch)
  const e1rmDelta =
    prevMaxE1RM > 0 ? (currentE1RM - prevMaxE1RM) / prevMaxE1RM : 0.0;

  // Echten Satz in 'records' eintragen
  conn.insertRecord(machineId, ex_id, weight, reps, rir, set);

  // Trainingsdaten-Satz für das spätere NN in 'nn_training_logs' speichern

  conn.insertNNTrainingLog(
    machineId,
    features[0],
    features[1],
    features[2],
    features[3],
    features[4],
    features[5],
    calculatedScore,
    prevMaxE1RM,
    currentE1RM,
    e1rmDelta,
  );
}
