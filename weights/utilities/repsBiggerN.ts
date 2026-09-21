export default function repsBiggerThanN(reps: number[], n: number) {
  for (let index = 0; index < reps.length; index++) {
    if (reps[index] <= n) return false;
  }

  return true;
}
