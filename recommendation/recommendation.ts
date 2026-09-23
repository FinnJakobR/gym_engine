import Database from "../db/db";
import { Maschine } from "../weights/interfaces/maschine";
import generateFeatureVector from "./features";
import linearScore from "./score/linearScore";
import * as tf from "@tensorflow/tfjs";

export interface Recommendation {
  maschine: Maschine;
  features: number[];
  score: number;
}

//TODO ADD CHANGE TO NN

export function getRecommendedMachines(
  conn: Database,
  topN: number = 5,
): Recommendation[] {
  const allMachines = conn.getAllMachines();

  //Berechne Features & Linear Score für jede Maschine
  const scoredMachines = allMachines.map((maschine) => {
    const features = generateFeatureVector(conn, maschine, allMachines);
    const score = linearScore(features);

    console.log(maschine.exercise_def_id, score);

    return {
      maschine,
      features,
      score,
    };
  });

  //Sortiere absteigend nach Score
  scoredMachines.sort((a, b) => b.score - a.score);

  // Top N Maschinen zurückgeben
  return scoredMachines.slice(0, topN);
}

export function getBatchedRecommendations(
  conn: Database,
  aiModel: tf.LayersModel,
  topN: number,
): Recommendation[] {
  const allMaschines = conn.getAllMachines();

  // 1. Alle Feature-Vektoren sammeln
  const allFeatures = allMaschines.map((m) =>
    generateFeatureVector(conn, m, allMaschines),
  );

  // 2. EINEN großen Tensor bauen (Form: [AnzahlMaschinen, 6 Features])
  const batchInput = tf.tensor2d(allFeatures, [allMaschines.length, 6]);

  // 3. EINE einzige Prediction für alle Maschinen gleichzeitig machen
  const predictions = aiModel.predict(batchInput) as tf.Tensor;
  const predictedDeltas = predictions.dataSync(); // Gibt ein Array mit z.B. 50 Werten zurück

  // RAM aufräumen
  batchInput.dispose();
  predictions.dispose();

  // 4. Ergebnisse mit den Maschinen verheiraten und sortieren
  const scoredMachines = allMaschines.map((maschine, index) => ({
    maschine,
    features: allFeatures[index],
    score: predictedDeltas[index],
  }));

  return scoredMachines.sort((a, b) => b.score - a.score).slice(0, topN);
}
