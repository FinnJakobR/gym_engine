import { AiService } from "../ai/ai";
import Database from "../db/db";
import { logCompletedSet } from "../recommendation/log/logSet";
import {
  getBatchedRecommendations,
  getRecommendedMachines,
} from "../recommendation/recommendation";
import { RETRAIN_CYCLE, WARMUP_PROCENT } from "../settings/settings";
import { Maschine } from "../weights/interfaces/maschine";
import floorWeight from "../weights/utilities/floorWeight";
import nextWeight from "../weights/weights";
import { Player, PlayerState } from "./types/player";
import { getPauseTime } from "./util/pause";
import UNREACHABLE from "./util/unreachable";

export default class Workouts {
  players: Player[] = [];
  conn: Database;
  retrain: boolean = false;
  ai: AiService;

  constructor(conn: Database, ai: AiService) {
    this.conn = conn;
    this.ai = ai;

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

    //Wir speichern keine Aufwärmsätze da diese nur potenzielle Bugs bringen
    if (p.set > 1) {
      logCompletedSet(
        this.conn,
        currentMaschine.id,
        currentRecommendation.features,
        currentRecommendation.score,
        weight,
        reps,
        rir,
        completedSet, // <- Hier übergibst du sauber 1, 2 oder 3!
        ex_id,
      );
    }

    this.setPause(p);
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

      if (this.retrain) {
        console.log("Retrain Neuronal Network");
        this.ai.trainModel(this.conn);
        this.retrain = false;
      }

      return { ok: 1, start_time: new Date(), ended: true };
    }

    const nextRecommendation = p.maschines[p.maschine_index];
    const nextMaschine = nextRecommendation.maschine;

    const lastSet = this.conn.getLastRecords(nextMaschine.id, 1)[0];

    //das kann passieren wenn es nur aufwärmrecords gibt
    if (!lastSet) {
      console.log("No last Set found!");
      return {
        ok: 1,
        start_time: new Date(),
        ended: false,
        weight: !p.is_new_maschine
          ? floorWeight(weight / WARMUP_PROCENT, nextMaschine.steps)
          : -1,
        reps: !p.is_new_maschine ? reps : -1,
      };
    }

    const data = this.calculateNextWeight(p);

    if (!this.retrain) {
      this.retrain = this.checkForRetraining();
    }

    return {
      ok: 1,
      start_time: new Date(),
      ended: false,
      weight: data.weight,
      reps: data.reps,
    };
  }

  /*Retraine das NN immer nach 20 Logs */
  private checkForRetraining() {
    const nn_training_logs = this.conn.getNNTrainingsdata();
    return nn_training_logs.trainX.length % RETRAIN_CYCLE == 0;
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

    let recommendations;

    if (this.conn.getNNTrainingsdata().trainX.length < 2000) {
      recommendations = getRecommendedMachines(this.conn, 1);
    } else {
      recommendations = getBatchedRecommendations(this.conn, this.ai.model, 1);
    }

    if (recommendations.length > 1) UNREACHABLE("getNextMaschine(...)");

    const recommendation = recommendations[0];

    p.maschines.push(recommendation);
  }

  private saveWorkout(start_time: Date) {
    const now = new Date();
    const id = this.conn.insertWorkout(start_time, now);

    return id;
  }

  private setPause(p: Player) {
    p.state = PlayerState.PAUSE;
    p.lastPause = new Date();
  }

  public skipSet(user_id: number) {
    const p = this.getPlayerById(user_id)!;

    p.set++;

    if (p.set > 3) {
      return this.skipMaschine(user_id);
    }

    this.setPause(p);

    const currentMaschine = p.maschines[p.maschine_index].maschine;
    const lastSet = this.conn.getLastRecords(currentMaschine.id, 1)[0];

    if (!lastSet) {
      return {
        ok: 1,
        weight: -1,
        reps: -1,
      };
    }

    const w = this.calculateNextWeight(p);

    return {
      ok: 1,
      ...w,
    };
  }

  public skipMaschine(user_id: number) {
    const p = this.getPlayerById(user_id)!;

    this.getNextMaschine(user_id);

    p.state = 1;
    p.is_new_maschine = true;
    p.maschine_index++;

    const currentMaschine = p.maschines[p.maschine_index].maschine;
    const lastSet = this.conn.getLastRecords(currentMaschine.id, 1)[0];

    this.setPause(p);

    if (!lastSet) {
      return {
        ok: 1,
        weight: -1,
        reps: -1,
      };
    }

    const w = this.calculateNextWeight(p);

    return {
      ok: 1,
      ...w,
    };
  }

  private endWorkout(p: Player) {
    this.conn.endWorkout(new Date(), p.workout_id);
  }

  private calculateNextWeight(p: Player): { weight: number; reps: number } {
    const nextRecommendation = p.maschines[p.maschine_index];
    const nextMaschine = nextRecommendation.maschine;

    const lastSet = this.conn.getLastRecords(nextMaschine.id, 1)[0];
    const lastThreeSets = this.conn.getLastRecords(nextMaschine.id, 3);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysInactive = lastSet
      ? (Date.now() - lastSet.date.getTime()) / msPerDay
      : 14;

    const plateauWeeks = this.getPlatoeWeeks(nextMaschine);

    const w = nextWeight(
      nextMaschine,
      lastSet,
      lastThreeSets,
      daysInactive,
      plateauWeeks,
      p.set == 1,
    );

    return w;
  }

  start(user_id: number, rounds: number) {
    const has_workout = this.hasWorkout(user_id);
    if (has_workout) return { ok: 0, weights: -1, reps: -1 };

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

    const lastSet = this.conn.getLastRecords(
      newPlayer.maschines[0].maschine.id,
      1,
    )[0];

    console.log(lastSet);

    //damit Wissen wir, dass die Maschine noch nie benutzt wurde
    if (!lastSet) {
      return { ok: 1, weights: -1, reps: -1 };
    }

    const w = this.calculateNextWeight(newPlayer);

    return { ok: 1, ...w };
  }
}
