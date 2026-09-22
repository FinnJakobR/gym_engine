import Fatigue from "../weights/interfaces/fatigue";
import MuscleFocus from "../weights/interfaces/focus";
import { MuscleGroup } from "../weights/interfaces/muscles";

/*In dieser Datei definieren wir alle Übungen! 
Ich habe mich dagegen entschieden das in der DB zu speichern, da 
es sich nicht um dynamische Daten handelt
*/

export interface ExerciseDefinition {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  synergists: MuscleGroup[];
  antagonist: MuscleGroup;
  focus: MuscleFocus;
  fatigue: Fatigue;
  movementPattern: "LEGS" | "PUSH" | "PULL" | "ISOLATION";
}

export const EXERCISE_DEFINITIONS: Record<string, ExerciseDefinition> = {
  leg_press: {
    id: "leg_press",
    name: "Beinpresse 45°",
    primaryMuscle: MuscleGroup.QUADRICEPS,
    synergists: [MuscleGroup.GLUTES],
    antagonist: MuscleGroup.HAMSTRINGS,
    movementPattern: "LEGS",
    focus: MuscleFocus.STRECHTED,
    fatigue: Fatigue.HIGH,
  },

  shoulder_press_machine: {
    id: "shoulder_press_machine",
    name: "Schulterpresse",
    primaryMuscle: MuscleGroup.DELTS_ANTERIOR,
    synergists: [
      MuscleGroup.DELTS_LATERAL,
      MuscleGroup.TRICEPS_LATERAL_MEDIAL,
      MuscleGroup.TRAPS_UPPER,
    ],
    antagonist: MuscleGroup.LATS,
    movementPattern: "PUSH",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.HIGH,
  },

  leg_curl_machine: {
    id: "leg_curl_machine",
    name: "Beinbeuger (Leg Curl)",
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    synergists: [MuscleGroup.CALVES],
    antagonist: MuscleGroup.QUADRICEPS,
    movementPattern: "LEGS",
    focus: MuscleFocus.STRECHTED,
    fatigue: Fatigue.SMALL,
  },

  butterfly_machine: {
    id: "butterfly_machine",
    name: "Butterfly (Peck Deck)",
    primaryMuscle: MuscleGroup.CHEST_MIDDLE,
    synergists: [MuscleGroup.CHEST_UPPER, MuscleGroup.DELTS_ANTERIOR],
    antagonist: MuscleGroup.DELTS_POSTERIOR,
    movementPattern: "PUSH",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.HIGH,
  },

  lateral_raise_machine: {
    id: "lateral_raise_machine",
    name: "Seitheben (Maschine / Kabel)",
    primaryMuscle: MuscleGroup.DELTS_LATERAL,
    synergists: [MuscleGroup.TRAPS_UPPER],
    antagonist: MuscleGroup.LATS,
    movementPattern: "PUSH",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.NORMAL,
  },

  dips: {
    id: "dips",
    name: "Dips",
    primaryMuscle: MuscleGroup.TRICEPS_LATERAL_MEDIAL,
    synergists: [MuscleGroup.CHEST_LOWER, MuscleGroup.DELTS_ANTERIOR],
    antagonist: MuscleGroup.BICEPS,
    movementPattern: "PUSH",
    focus: MuscleFocus.STRECHTED,
    fatigue: Fatigue.NORMAL,
  },

  pull_ups: {
    id: "pull_ups",
    name: "Klimmzüge (Pull-Ups)",
    primaryMuscle: MuscleGroup.LATS,
    synergists: [
      MuscleGroup.UPPER_BACK,
      MuscleGroup.BICEPS,
      MuscleGroup.BRACHIALIS,
    ],
    antagonist: MuscleGroup.DELTS_ANTERIOR,
    movementPattern: "PULL",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.HIGH,
  },

  preacher_curl: {
    id: "preacher_curl",
    name: "Preacher Curls (Scott-Curls)",
    primaryMuscle: MuscleGroup.BICEPS,
    synergists: [MuscleGroup.BRACHIALIS],
    antagonist: MuscleGroup.TRICEPS_LATERAL_MEDIAL,
    movementPattern: "ISOLATION",
    focus: MuscleFocus.STRECHTED,
    fatigue: Fatigue.SMALL,
  },

  preacher_hammer_curl: {
    id: "preacher_hammer_curl",
    name: "Preacher Hammer Curls",
    primaryMuscle: MuscleGroup.BRACHIALIS,
    synergists: [MuscleGroup.BICEPS],
    antagonist: MuscleGroup.TRICEPS_LATERAL_MEDIAL,
    movementPattern: "ISOLATION",
    focus: MuscleFocus.STRECHTED,
    fatigue: Fatigue.SMALL,
  },

  reverse_butterfly_machine: {
    id: "reverse_butterfly_machine",
    name: "Reverse Butterfly (Pec Deck Reverse)",
    primaryMuscle: MuscleGroup.DELTS_POSTERIOR,
    synergists: [MuscleGroup.UPPER_BACK, MuscleGroup.TRAPS_UPPER],
    antagonist: MuscleGroup.CHEST_MIDDLE,
    movementPattern: "PULL",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.SMALL,
  },

  leg_extension_machine: {
    id: "leg_extension_machine",
    name: "Beinstrecker (Leg Extension)",
    primaryMuscle: MuscleGroup.QUADRICEPS,
    synergists: [],
    antagonist: MuscleGroup.HAMSTRINGS,
    movementPattern: "LEGS",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.NORMAL,
  },

  abs_machine: {
    id: "abs_machine",
    name: "Bauchmaschine (Crunch Machine)",
    primaryMuscle: MuscleGroup.ABS,
    synergists: [],
    antagonist: MuscleGroup.LOWER_BACK,
    movementPattern: "ISOLATION",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.SMALL,
  },

  close_grip_row: {
    id: "close_grip_row",
    name: "Enges Rudern (Kabel / Maschine)",
    primaryMuscle: MuscleGroup.LATS,
    synergists: [
      MuscleGroup.UPPER_BACK,
      MuscleGroup.BICEPS,
      MuscleGroup.DELTS_POSTERIOR,
    ],
    antagonist: MuscleGroup.CHEST_MIDDLE,
    movementPattern: "PULL",
    focus: MuscleFocus.CONTRACTED,
    fatigue: Fatigue.HIGH,
  },
};
