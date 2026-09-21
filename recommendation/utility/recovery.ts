import { EXERCISE_DEFINITIONS } from "../../data/exerciseDefinition";
import Database from "../../db/db";
import { Maschine } from "../../weights/interfaces/maschine";
import { MuscleGroup } from "../../weights/interfaces/muscles";

// Hilfsfunktion: Wandelt ms-Differenz in Tage um
function getDaysSince(date: Date | undefined): number {
  if (!date) return 14; // Wenn nie trainiert: voll erholt (maximaler Wert)
  const diffTime = Math.abs(Date.now() - date.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return Math.min(Math.floor(diffDays), 14); // Cappen bei 14 Tagen
}

// Hilfsfunktion: Wann wurde eine spezifische MUSKELGRUPPE zuletzt trainiert?
function getLastTrainedForMuscle(
  conn: Database,
  targetMuscle: MuscleGroup,
  allMachines: Maschine[],
): Date | undefined {
  //Finde alle Maschinen, die diesen Muskel als Hauptmuskel ODER Synergist haben
  const relevantMachineIds = allMachines
    .filter((m) => {
      const def = EXERCISE_DEFINITIONS[m.exercise_def_id];
      if (!def) return false;
      return (
        def.primaryMuscle === targetMuscle ||
        def.synergists.includes(targetMuscle)
      );
    })
    .map((m) => m.id);

  if (relevantMachineIds.length === 0) return undefined;

  // Hole das neuste Datum aus allen diesen Maschinen aus der DB
  return conn.getLastTrainedForMachineIds(relevantMachineIds);
}

export interface MachineRecoveryFeatures {
  primaryMuscleDays: number; // Erholung Zielmuskel
  synergistMinDays: number; // Erholung des müdesten Synergisten
  antagonistDays: number; // Erholung des Gegenspielers
  thisMachineDays: number; // Spezifische Maschinen-Erholung
}

export default function extractRecoveryFeatures(
  conn: Database,
  maschine: Maschine,
  allMachines: Maschine[],
): MachineRecoveryFeatures {
  const def = EXERCISE_DEFINITIONS[maschine.exercise_def_id];

  // Wann wurde exakt DIESE Maschine zuletzt genutzt?
  const lastMachineDate = conn.getLastTrained(maschine.id);

  //Wenn die Maschine noch nie geübt wurde packe einfach 14 Tage ran
  let thisMachineDays = getDaysSince(lastMachineDate);

  // Wann wurde der PRIMÄRMUSKEL zuletzt belastet?
  const primaryDate = getLastTrainedForMuscle(
    conn,
    def.primaryMuscle,
    allMachines,
  );

  let primaryMuscleDays = getDaysSince(primaryDate);

  // Wann wurden die SYNERGISTEN zuletzt belastet? (Nimm den müdesten / kleinsten Wert)
  let minSynergistDays = 14;
  if (def.synergists && def.synergists.length > 0) {
    const synergistDaysList = def.synergists.map((syn) => {
      const synDate = getLastTrainedForMuscle(conn, syn, allMachines);
      return getDaysSince(synDate);
    });
    minSynergistDays = Math.min(...synergistDaysList);
  }

  // Wann wurde der ANTAGONIST zuletzt belastet?
  let antagonistDays = 14;
  if (def.antagonist) {
    const antDate = getLastTrainedForMuscle(conn, def.antagonist, allMachines);
    antagonistDays = getDaysSince(antDate);
  }

  //fürs NN normalisiere die Werte
  primaryMuscleDays /= 14;
  minSynergistDays /= 14;
  antagonistDays /= 14;
  thisMachineDays /= 14;

  return {
    primaryMuscleDays,
    synergistMinDays: minSynergistDays,
    antagonistDays,
    thisMachineDays,
  };
}
