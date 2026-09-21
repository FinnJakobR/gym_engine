import Database from "../db/db";
import { Maschine } from "../weights/interfaces/maschine";
import extractPerformance from "./utility/performance";
import extractRecoveryFeatures from "./utility/recovery";
import extractStaleness from "./utility/staleness";

export default function generateFeatureVector(
  conn: Database,
  maschine: Maschine,
  all_maschines: Maschine[],
) {
  const performance = extractPerformance(conn, maschine);
  const staleness = extractStaleness(conn, maschine);
  const recovery = extractRecoveryFeatures(conn, maschine, all_maschines);

  return [
    performance,
    staleness,
    recovery.antagonistDays,
    recovery.primaryMuscleDays,
    recovery.synergistMinDays,
    recovery.thisMachineDays,
  ];
}
