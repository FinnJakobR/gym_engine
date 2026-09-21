//Runde das gewicht zum nächsten Step eg. 2.5
export default function floorWeight(weight: number, step: number): number {
  return Math.floor(weight / step) * step;
}
