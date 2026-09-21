import { Recommendation } from "../../recommendation/recommendation";
import { Maschine } from "../../weights/interfaces/maschine";

export enum PlayerState {
  PAUSE,
  SET,
}

export interface Player {
  user_id: number;
  state: PlayerState;
  start_time: Date;
  lastPause: Date | null;
  set: number;
  maschines: Recommendation[];
  is_new_maschine: boolean;
  maschine_index: number;
  workout_id: number;
  rounds: number; //Rounds beschreibt wie viele Maschine wir bei dem Workout verwenden
}
