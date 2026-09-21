import Database from "../db/db";
import { logCompletedSet } from "../recommendation/log/logSet";
import { getRecommendedMachines } from "../recommendation/recommendation";
import { Maschine } from "../weights/interfaces/maschine";
import nextWeight from "../weights/weights";
import { Player, PlayerState } from "./types/player";
import { getPauseTime } from "./util/pause";
import UNREACHABLE from "./util/unreachable";

export default class Workouts {
  players: Player[] = [];
  conn: Database;

  constructor(conn: Database) {
    this.conn = conn;
    this.listenForPauses();
  }

  private listenForPauses() {
    setInterval(() => {
      for (const p of this.players) {
        if (!p.lastPause) continue;

        const currentTime = Date.now();
        if (currentTime - p.lastPause.getTime() > getPauseTime(p)) {
          console.log("TODO: SEND BOT MESSAGE PAUSE ENDED");

          p.state = PlayerState.SET;
          p.lastPause = null;
        }
      }
    }, 1000);
  }

  public getPlayerById(user_id: number) {
    return this.players.find((e) => e.user_id === user_id);
  }

  private deleteUserById(user_id: number) {
    const index = this.players.findIndex((e) => e.user_id === user_id);
    this.players.splice(index, 1);
  }

  private hasWorkout(user_id: number) {
    return this.players.find((e) => e.user_id === user_id) != undefined;
  }

  next(user_id: number, weight: number, reps: number, rir: number) {
    if (!this.hasWorkout(user_id))
      return { ok: 0, start_time: new Date(), ended: true };

    const p = this.getPlayerById(user_id)!;

    // 1. ZUSTAND VOR DEM HOCHZÄHLEN MERKEN (Der gerade absolvierte Satz)
    const completedSet = p.set;
    const currentRecommendation = p.maschines[p.maschine_index];
    const currentMaschine = currentRecommendation.maschine;

    if (p.is_new_maschine) p.is_new_maschine = false;

    // 2. EXERCISED INSTANCE & SATZ SPEICHERN (Exakt für die aktuelle Maschine!)
    const ex_id = this.conn.insertExercises(currentMaschine.id, p.workout_id);

    logCompletedSet(
      this.conn,
      currentMaschine.id,
      currentRecommendation.features,
      currentRecommendation.score,
      weight,
      reps,
      rir,
      completedSet === 1, // is_warmup / first_set Check
      completedSet, // <- Hier übergibst du sauber 1, 2 oder 3!
      ex_id,
    );

    // 3. JETZT DEN STATE FÜR DEN NÄCHSTEN SATZ/MASCHINE HOCHZÄHLEN
    p.state = PlayerState.PAUSE;
    p.lastPause = new Date();
    p.set++;

    // Wenn 3 Sätze auf dieser Maschine durch sind -> Weiter zur nächsten
    if (p.set > 3) {
      this.getNextMaschine(p.user_id);
      p.set = 1;
      p.maschine_index++;
      p.is_new_maschine = true;
    }

    // 4. PRÜFEN OB WORKOUT BEENDET IST
    if (p.maschine_index >= p.rounds) {
      this.endWorkout(p);
      this.deleteUserById(p.user_id);
      return { ok: 1, start_time: new Date(), ended: true };
    }

    // EMPFEHLUNG FÜR DEN NÄCHSTEN SATZ BERECHNEN
    // (Falls Maschine gewechselt wurde, holen wir die neue Empfehlung)
    const nextRecommendation = p.maschines[p.maschine_index];
    const nextMaschine = nextRecommendation.maschine;

    const lastSet = this.conn.getLastRecords(nextMaschine.id, 1)[0];
    const lastThreeSets = this.conn.getLastRecords(nextMaschine.id, 3);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysInactive = lastSet
      ? (Date.now() - lastSet.date.getTime()) / msPerDay
      : 14;

    const plateauWeeks = this.getPlatoeWeeks(nextMaschine);

    //das kann passieren wenn es nur aufwärmrecords gibt
    if (!lastSet) {
      console.log("No last Set found!");
      return {
        ok: 1,
        start_time: new Date(),
        ended: false,
        weight: weight,
        reps: reps,
      };
    }

    const data = nextWeight(
      nextMaschine,
      lastSet,
      lastThreeSets,
      daysInactive,
      plateauWeeks,
      p.set === 1,
    );

    return {
      ok: 1,
      start_time: new Date(),
      ended: false,
      weight: data.weight,
      reps: data.reps,
    };
  }

  private getPlatoeWeeks(m: Maschine): number {
    const records = this.conn.getAllRecordsById(m.id);

    if (records.length <= 1) return 0;
    const lastRecord = records[0];

    for (let i = 1; i < records.length; i++) {
      if (records[i].weight < lastRecord.weight) {
        const lastRecordDate = lastRecord.date;
        const platoeStartRecordDate = records[i].date;

        const msPerDay = 1000 * 60 * 60 * 24; // 86.400.000 ms
        const daysPlatoe =
          (lastRecordDate.getTime() - platoeStartRecordDate.getTime()) /
          msPerDay;
        return daysPlatoe;
      }
    }

    return 0;
  }

  private getNextMaschine(user_id: number) {
    const p = this.getPlayerById(user_id);

    if (!p) return;

    const recommendations = getRecommendedMachines(this.conn, 1);

    if (recommendations.length > 1) UNREACHABLE("getNextMaschine(...)");

    const recommendation = recommendations[0];

    p.maschines.push(recommendation);
  }

  private saveWorkout(start_time: Date) {
    const now = new Date();
    const id = this.conn.insertWorkout(start_time, now);
    ///UNIMPLEMENTED("this.conn.addWorkout(...)");

    return id;
  }

  private endWorkout(p: Player) {
    this.conn.endWorkout(new Date(), p.workout_id);
  }

  start(user_id: number, rounds: number) {
    const has_workout = this.hasWorkout(user_id);
    if (has_workout) return 0;

    const workout_id = this.saveWorkout(new Date());

    const newPlayer: Player = {
      user_id,
      state: PlayerState.SET,
      set: 1,
      lastPause: null,
      start_time: new Date(),
      maschine_index: 0,
      is_new_maschine: true,
      maschines: [],
      rounds: rounds,
      workout_id,
    };

    this.players.push(newPlayer);

    this.getNextMaschine(user_id);

    //UNIMPLEMENTED("Workout.start(...)");

    return 1;
  }
}
