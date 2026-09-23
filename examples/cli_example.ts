import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import Database from "../db/db";
import Workouts from "../workout/workout";
import { Player, PlayerState } from "../workout/types/player";
import { AiService } from "../ai/ai";

const MOCK_ID = 420;

const main = async () => {
  const conn = new Database();

  conn.insertMockMaschines("./db/schemes/testMaschines.sql");

  const ai = new AiService();

  await ai.tryLoadModel(conn);

  const workouts = new Workouts(conn, ai);

  const rl = readline.createInterface({ input, output });

  if (!workouts.start(MOCK_ID, 1)) {
    console.log("❌ Fehler: Workout konnte nicht gestartet werden.");
    rl.close();
    return;
  }

  console.log("\n🏋️  === WORKOUT SIMULATOR GESTARTET === 🏋️\n");

  let weight = 0;
  let rir = 0;
  let reps = 0;

  while (true) {
    // 1. Aktuellen Player-State holen
    const p = workouts.getPlayerById(MOCK_ID) as Player | undefined;
    if (!p) {
      console.log("⚠️ [DEBUG] Player nicht gefunden. Abbruch.");
      break;
    }

    // Maschinen-Info für sauberes Debugging auflösen
    const currentRec = p.maschines[p.maschine_index];
    const machineName =
      currentRec?.maschine?.name ||
      `Maschine-ID: ${currentRec?.maschine?.id || "Unbekannt"}`;

    // Ausführliches Debug-Log ausgeben
    console.log("--------------------------------------------------");
    console.log(
      `📌 [DEBUG] Maschine ${p.maschine_index + 1} von ${p.rounds}: ${machineName}`,
    );
    console.log(`🔢 [DEBUG] Aktueller Satz (Set): #${p.set}`);
    console.log(
      `🔄 [DEBUG] Status: ${p.state === PlayerState.PAUSE ? "PAUSE" : "SET"}`,
    );
    if (p.is_new_maschine) {
      console.log(`🆕 [DEBUG] Neue Maschine gewechselt!`);
    }
    console.log("--------------------------------------------------");

    // Interaktive Abfrage über die Konsole
    const weightInput = await rl.question("  👉 Gewicht (kg): ");
    const repsInput = await rl.question("  👉 Wiederholungen (Reps): ");
    const rirInput = await rl.question("  👉 Reps in Reserve (RIR): ");

    // Inputs parsen und in Variablen schreiben
    weight = parseFloat(weightInput) || 0;
    reps = parseInt(repsInput, 10) || 0;
    rir = parseInt(rirInput, 10) || 0;

    console.log(
      `\n💾 Sende Satz an Engine: [${weight}kg x ${reps} Reps | RIR: ${rir}]`,
    );

    // Satz verarbeiten & prüfen ob das Workout zu Ende ist
    const result = workouts.next(MOCK_ID, weight, reps, rir);

    if (result.ended) {
      console.log("\n🎉 =========================================== 🎉");
      console.log("   WORKOUT BEENDET & ERFOLGREICH GELOGGT!");
      console.log("🎉 =========================================== 🎉\n");
      break;
    }

    console.log("Weights: " + result.weight + " Reps: " + result.reps);

    console.log("\n"); // Leerzeile für Übersichtlichkeit
  }

  rl.close();
};

main();
