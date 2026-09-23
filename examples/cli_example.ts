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

  if (!workouts.start(MOCK_ID, 5)) {
    console.log("❌ Fehler: Workout konnte nicht gestartet werden.");
    rl.close();
    return;
  }

  console.log("\n🏋️  === WORKOUT SIMULATOR GESTARTET === 🏋️\n");

  // Speichert die aktuell von der Engine empfohlenen Werte (-1 = keine Historie)
  let suggestedWeight = -1;
  let suggestedReps = -1;

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

    // Empfehlungs-Logik auswerten & anzeigen
    if (suggestedWeight === -1 && suggestedReps === -1) {
      console.log(
        "ℹ️ [INFO] Maschine wurde noch nie benutzt (keine Daten vorhanden).",
      );
    } else if (suggestedWeight > -1 && suggestedReps > -1) {
      console.log(
        `💡 [EMPFEHLUNG] Vorgabe: ${suggestedWeight} kg x ${suggestedReps} Reps (Enter drückt Standardwert)`,
      );
    }
    console.log("--------------------------------------------------");

    // Interaktive Abfrage über die Konsole
    const weightInput = await rl.question(
      suggestedWeight > -1
        ? `  👉 Gewicht (kg) [Standard: ${suggestedWeight}]: `
        : "  👉 Gewicht (kg): ",
    );
    const repsInput = await rl.question(
      suggestedReps > -1
        ? `  👉 Wiederholungen (Reps) [Standard: ${suggestedReps}]: `
        : "  👉 Wiederholungen (Reps): ",
    );
    const rirInput = await rl.question("  👉 Reps in Reserve (RIR): ");

    // Inputs parsen: Verwende Eingabe ODER Fallback auf die Empfehlung (falls vorhanden)
    const weight =
      weightInput.trim() !== ""
        ? parseFloat(weightInput) || 0
        : suggestedWeight > -1
          ? suggestedWeight
          : 0;

    const reps =
      repsInput.trim() !== ""
        ? parseInt(repsInput, 10) || 0
        : suggestedReps > -1
          ? suggestedReps
          : 0;

    const rir = parseInt(rirInput, 10) || 0;

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

    // Empfohlene Werte aus result für die NÄCHSTE Runde speichern
    suggestedWeight = result.weight!;
    suggestedReps = result.reps!;

    console.log(
      `\n➡️ Nächster Zielwert aus Engine -> Weight: ${result.weight} | Reps: ${result.reps}`,
    );
    console.log("\n"); // Leerzeile für Übersichtlichkeit
  }

  rl.close();
};

main();
