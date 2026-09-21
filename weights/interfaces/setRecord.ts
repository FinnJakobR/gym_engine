export default class SetRecord {
  public weight: number;
  public reps: number;
  public rir?: number;
  public date: Date;

  constructor(
    weight: number,
    reps: number,
    rir: number | undefined = undefined,
    date: Date,
  ) {
    this.weight = weight;
    this.reps = reps;
    this.rir = rir;
    this.date = date;
  }
}
