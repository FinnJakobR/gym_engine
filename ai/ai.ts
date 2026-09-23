import * as tf from "@tensorflow/tfjs";
import Database from "../db/db";

export class AiService {
  public model: tf.Sequential;

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

  public async tryLoadModel(conn: Database): Promise<boolean> {
    const json_str = conn.getWeights();

    if (!json_str) return false;

    const payload = JSON.parse(json_str);

    const weight_buffer = Buffer.from(payload.weightData, "base64");

    const weight_array_buffer = weight_buffer.buffer.slice(
      weight_buffer.byteOffset,
      weight_buffer.byteOffset + weight_buffer.byteLength,
    );

    const modelArtifacts: tf.io.ModelArtifacts = {
      modelTopology: payload.modelTopology,
      weightSpecs: payload.weightSpecs,
      weightData: weight_array_buffer,
    };

    this.model = (await tf.loadLayersModel(
      tf.io.fromMemory(modelArtifacts),
    )) as tf.Sequential;

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: "meanSquaredError",
      metrics: ["mae"],
    });

    console.log("Modell erfolgreich aus der DB geladen!");

    return true;
  }

  public async trainModel(conn: Database) {
    console.log("Hole Trainingsdaten aus DB...");

    const { trainX, trainY } = conn.getNNTrainingsdata();

    // In TensorFlow Tensoren konvertieren
    const xs = tf.tensor2d(trainX, [trainX.length, 6]);
    const ys = tf.tensor2d(trainY, [trainY.length, 1]);

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

    await this.model.save(
      tf.io.withSaveHandler(async (artifacts: tf.io.ModelArtifacts) => {
        const weight_data_base64 = Buffer.from(
          artifacts.weightData as ArrayBuffer,
        ).toString("base64");

        const modelPayload = {
          modelTopology: artifacts.modelTopology,
          weightSpecs: artifacts.weightSpecs,
          weightData: weight_data_base64,
        };

        const json_str = JSON.stringify(modelPayload);
        conn.insertWeights(json_str);

        return {
          modelArtifactsInfo: {
            dateSaved: new Date(),
            modelTopologyType: "JSON",
          },
        };
      }),
    );

    await this.tryLoadModel(conn);
  }
}
