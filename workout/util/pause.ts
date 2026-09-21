import { Player } from "../types/player";

export function getPauseTime(p: Player) {
  const MIN = 1 * 60 * 1000;

  if (!p.is_new_maschine) return (p.set - 1) * (1.5 * MIN);

  return MIN;
}
