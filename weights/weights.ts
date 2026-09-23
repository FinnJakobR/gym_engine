import { Maschine } from "./interfaces/maschine";
import SetRecord from "./interfaces/setRecord";
import decayScore from "./utilities/decay";
import inactivityScore from "./utilities/inactivity";
import platoeToleranz from "./utilities/platoe";
import isRepRegression from "./utilities/regRegression";
import repsBiggerThanN from "./utilities/repsBiggerN";
import isSameWeight from "./utilities/sameWeight";
import floorWeights from "./utilities/floorWeight";
import { WARMUP_PROCENT } from "../settings/settings";

export default function nextWeight(
  maschine: Maschine,
  lastWeight: SetRecord,
  lastThreeSets: SetRecord[],
  daysInactive: number,
  plateauWeeks: number,
  isWarmup: boolean,
) {
  const step = maschine.steps;

  const inactivityLevel = inactivityScore(lastWeight.weight);

  let baseWeight = lastWeight.weight;

  console.log(baseWeight);

  //checke ob es einen Muskelverlust durch zu lange Pause exisitert.
  if (daysInactive >= inactivityLevel) {
    const decay = decayScore(daysInactive);
    baseWeight = baseWeight * (1.0 - decay);

    return {
      weight: floorWeights(baseWeight, step),
      reps: Math.max(6, maschine.max_reps),
    };
  }

  //wenn es Warmup ist, dann gebe 80% des letzten gewichtes zurück
  if (isWarmup) {
    return { weight: floorWeights(baseWeight * WARMUP_PROCENT, step), reps: 4 };
  }

  //wenn nicht genung Daten vorhanden sind, dann gebe einfach den Baseweight zurück
  if (lastThreeSets.length < 3) {
    return { weight: baseWeight, reps: lastWeight.reps };
  }

  //check ob eine kurzfristige Rep Regression entsteht
  if (isRepRegression(lastThreeSets)) {
    return { weight: Math.max(baseWeight - step, 0), reps: 6 };
  }

  //checke ob ein Platoe vorhanden ist. Wenn ja mache ein deload von 90% des gewichtes
  const platoe = platoeToleranz(baseWeight);

  if (plateauWeeks >= platoe) {
    return { weight: floorWeights(baseWeight * 0.9, 2.5), reps: 5 };
  }

  const weights = lastThreeSets.map((e) => e.weight);
  const reps = lastThreeSets.map((e) => e.reps);

  const is_same_weights = isSameWeight(weights);

  if (is_same_weights && repsBiggerThanN(reps, maschine.max_reps)) {
    return { weight: baseWeight + step, reps: Math.min(5, maschine.max_reps) };
  }

  console.log("Get Last Weight!");

  return { weight: lastWeight.weight, reps: lastWeight.reps };
}
