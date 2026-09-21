import Database from "../../db/db";
import { Maschine } from "../../weights/interfaces/maschine";

export default function extractStaleness(conn: Database, maschine: Maschine) {
  const ex_dates = conn.getAllExercisesDates(maschine.id);

  const now = Date.now();
  const two_weeks = now - 14 * (1000 * 60 * 60 * 24);

  let i = 0;

  while (ex_dates[i] && ex_dates[i].getTime() > two_weeks) i++;

  return i / 14;
}
