import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  DAYS_SINCE_LAST_TRAINED_QUERY,
  END_WORKOUT_QUERY,
  GET_ALL_EXERCISES,
  GET_ALL_MASCHINES,
  GET_ALL_RECORDS_MASCHINE,
  GET_ALL_TRAININGS_DATE,
  GET_N_LAST_RECORDS,
  GET_PREVIOUS_1ERM,
  INSERT_EXERCISES,
  INSERT_NN_TRAINING_SET,
  INSERT_RECORD,
  INSERT_WORKOUT,
} from "./queries";
import { Maschine } from "../weights/interfaces/maschine";
import SetRecord from "../weights/interfaces/setRecord";

export default class Database {
  private scheme: string = "";
  private scheme_path: string = "./db/schemes/scheme.sql";
  private conn: DatabaseSync;
  private db_path: string = "./db/db.sqlite";

  constructor() {
    this.readScheme();
    this.conn = new DatabaseSync(this.db_path);
    this.init();
  }

  private readScheme() {
    this.scheme = readFileSync(this.scheme_path, { encoding: "utf-8" });
  }

  private init() {
    this.conn.exec(this.scheme);
  }

  private prepareQuery(str: string) {
    return this.conn.prepare(str);
  }

  public getAllMachines(): Maschine[] {
    const query = this.prepareQuery(GET_ALL_MASCHINES);

    const maschines: Maschine[] = [];

    const raw_maschines = query.all();

    for (const raw_maschine of raw_maschines) {
      maschines.push({
        name: String(raw_maschine["name"]),
        exercise_def_id: String(raw_maschine["exercise_def_id"]),
        id: Number(String(raw_maschine["id"])),
        max_reps: Number(String(raw_maschine["max_reps"])),
        steps: Number(String(raw_maschine["increment_step"])),
      });
    }

    return maschines;
  }

  public insertMockMaschines(sqlPath: string) {
    const sql = readFileSync(sqlPath, { encoding: "utf-8" });
    this.conn.exec(sql);
  }

  public getAllRecordsById(maschine_id: number): SetRecord[] {
    const records: SetRecord[] = [];

    const query = this.prepareQuery(GET_ALL_RECORDS_MASCHINE);

    const raw_records = query.all(maschine_id);

    for (const raw_record of raw_records) {
      records.push({
        weight: Number(String(raw_record["weight"])),
        reps: Number(String(raw_record["reps"])),
        rir: Number(String(raw_record["rir"])),
        date: new Date(String(raw_record["date"])),
      });
    }

    return records;
  }

  public getLastTrainedForMachineIds(maschine_ids: number[]): Date | undefined {
    let maschine_dates: Date[] = [];

    for (const maschine_id of maschine_ids) {
      const d = this.getLastTrained(maschine_id);
      if (d) maschine_dates.push(d);
    }

    if (maschine_dates.length == 0) return undefined;

    maschine_dates = maschine_dates.sort((a, b) => a.getTime() - b.getTime());

    return maschine_dates[0];
  }

  public getLastTrained(maschine_id: number): Date | undefined {
    const query = this.prepareQuery(DAYS_SINCE_LAST_TRAINED_QUERY);

    const raw_date = query.get(maschine_id);

    if (!raw_date) return undefined;

    return new Date(String(raw_date["date"]));
  }

  public getLastRecords(maschine_id: number, n: number) {
    const query = this.prepareQuery(GET_N_LAST_RECORDS);

    const raw_records = query.all(maschine_id, n);

    const records: SetRecord[] = [];
    for (const raw_record of raw_records) {
      records.push({
        weight: Number(String(raw_record["weight"])),
        reps: Number(String(raw_record["reps"])),
        rir: Number(String(raw_record["rir"])),
        date: new Date(String(raw_record["date"])),
      });
    }

    return records;
  }

  public getNNTrainingsdata(): { trainX: number[][]; trainY: number[] } {
    const query = this.prepareQuery(GET_ALL_TRAININGS_DATE);

    const raw_data = query.all();

    const trainX = raw_data.map((r) => [
      Number(r.f_performance),
      Number(r.f_staleness),
      Number(r.f_antagonist),
      Number(r.f_primary),
      Number(r.f_synergist),
      Number(r.f_maschine),
    ]);

    const trainY = raw_data.map((r) => Number(r.e1rm_delta));

    return { trainX, trainY };
  }

  public getAllExercisesDates(maschine_id: number): Date[] {
    const query = this.prepareQuery(GET_ALL_EXERCISES);
    const raw_eces = query.all(maschine_id);

    const dates: Date[] = [];

    for (const raw_ex of raw_eces) {
      if (!raw_ex) continue;

      dates.push(new Date(String(raw_ex["date"])));
    }

    return dates;
  }

  public insertExercises(maschine_id: number, workout_id: number): number {
    const query = this.prepareQuery(INSERT_EXERCISES);
    const res = query.run(maschine_id, workout_id);
    return res.lastInsertRowid as number;
  }

  public insertWorkout(start: Date, end: Date) {
    const query = this.prepareQuery(INSERT_WORKOUT);

    const res = query.run(start.toISOString(), end.toISOString());

    return res.lastInsertRowid as number;
  }

  public endWorkout(end: Date, workout_id: number) {
    const query = this.prepareQuery(END_WORKOUT_QUERY);
    query.run(end.toISOString(), workout_id);
  }

  public insertRecord(
    maschine_id: number,
    ex_id: number,
    weight: number,
    reps: number,
    rir: number,
    set: number,
    is_warmup: boolean,
  ) {
    const query = this.prepareQuery(INSERT_RECORD);
    query.run(
      ex_id,
      maschine_id,
      set, // <- Darf nicht fehlen!
      weight,
      reps,
      rir,
      is_warmup ? 1 : 0,
    );
  }

  public getPreviousMaxE1RM(maschine_id: number) {
    const query = this.prepareQuery(GET_PREVIOUS_1ERM);

    const raw = query.get(maschine_id);

    if (!raw) return undefined;

    const prev = Number(String(raw["e1rm_achieved"]));

    return prev;
  }

  public insertNNTrainingLog(
    maschine_id: number,
    f_performance: number,
    f_staleness: number,
    f_antagonist: number,
    f_primary: number,
    f_synergist: number,
    f_maschine: number,
    calculated_score: number,
    e1rm_before: number,
    e1rm_achieved: number,
    e1rm_delta: number,
  ) {
    const query = this.prepareQuery(INSERT_NN_TRAINING_SET);

    query.run(
      maschine_id,
      f_performance,
      f_staleness,
      f_antagonist,
      f_primary,
      f_synergist,
      f_maschine,
      calculated_score,
      e1rm_before,
      e1rm_achieved,
      e1rm_delta,
    );

    return;
  }
}
