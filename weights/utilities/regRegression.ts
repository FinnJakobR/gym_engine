import SetRecord from "../interfaces/setRecord";

/* Checkt ob eine Regression vorliegt Diese ist wie folgt definiert: 
  - Eine Regression liegt vor wenn alle reps im SetRecord Array kleiner werden und alle < 7
  
  Nimmt an: sets[0] = neuster Satz, sets[n] = ältester Satz
*/
export default function isRepRegression(sets: SetRecord[]) {
  let isReg = true;

  for (let i = 0; i < sets.length; i += 2) {
    isReg =
      isReg &&
      sets[i].reps < sets[i + 1].reps &&
      sets[i].reps < 7 &&
      sets[i + 1].reps < 7;

    if (!isReg) return isReg;
  }

  return isReg;
}
