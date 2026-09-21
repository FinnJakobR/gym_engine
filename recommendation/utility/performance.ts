import Database from "../../db/db";
import { E1RM, linearRegression } from "../../weakness/weakness";
import { Maschine } from "../../weights/interfaces/maschine";

export default function extractPerformance(conn: Database, maschine: Maschine) {
  const last_four_sessions = conn.getLastRecords(maschine.id, 4);

  const e1rm_history = last_four_sessions.map((e) => E1RM(e.weight, e.reps));

  return (linearRegression(e1rm_history) + 1) / 2;
}
