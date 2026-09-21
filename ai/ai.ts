import * as tf from "@tensorflow/tfjs-node";
import Database from "../db/db";

export class AiService {
  private model: tf.Sequential;

  constructor() {
    // 1. Architektur des Neural Networks definieren
    this.model = tf.sequential();

    // Input Layer + Hidden Layer 1 (16 Neuronen)
    this.model.add(
      tf.layers.dense({
        units: 16,
        activation: "relu",
        inputShape: [6], // 6 Features aus deiner nn_training_logs
      }),
    );

    // Hidden Layer 2 (8 Neuronen)
    this.model.add(
      tf.layers.dense({
        units: 8,
        activation: "relu",
      }),
    );

    // Output Layer (1 Neuron)
    // Activation ist standardmäßig 'linear' - perfekt,
    // da e1rm_delta auch negativ (Leistungsabfall) sein kann!
    this.model.add(tf.layers.dense({ units: 1 }));

    // 2. Modell kompilieren (Adam Optimizer & Mean Squared Error)
    this.model.compile({
      optimizer: tf.train.adam(0.001), // Learning Rate
      loss: "meanSquaredError",
      metrics: ["mae"], // Mean Absolute Error für besseres Monitoring
    });
  }

  // 3. Training mit Daten aus deiner SQLite Datenbank
  public async trainModel(conn: Database) {
    console.log("Hole Trainingsdaten aus DB...");

    const { trainX, trainY } = conn.getNNTrainingsdata();

    // In TensorFlow Tensoren konvertieren
    const xs = tf.tensor2d(trainX);
    const ys = tf.tensor2d(trainY);

    console.log("Starte NN Training...");

    // Trainieren
    await this.model.fit(xs, ys, {
      epochs: 50, // Wie oft geht er über alle Daten?
      batchSize: 32, // Wie viele Zeilen pro Berechnungsschritt?
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: Loss = ${logs?.loss.toFixed(4)}`);
          }
        },
      },
    });

    console.log("Training abgeschlossen!");

    // RAM freigeben
    xs.dispose();
    ys.dispose();

    // Modell speichern (z.B. lokal im Filesystem auf dem Raspberry Pi)
    await this.model.save("file://./models/gym-ai");
  }
}
