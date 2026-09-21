function datediff(first: number, second: number) {
  return Math.round(Math.abs(second - first) / (1000 * 60 * 60 * 24));
}
