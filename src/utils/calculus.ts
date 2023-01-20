// get random between range function with step
export function getRandomArbitrary(min: number, max: number, step: number) {
  return Math.floor((Math.random() * (max - min)) / step) * step + min;
}
