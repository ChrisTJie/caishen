export const RITUAL_STEP = 2;
export const RITUAL_MAX = 100;

export function tickRitualProgress(
  current: number,
  step = RITUAL_STEP,
  max = RITUAL_MAX,
): number {
  return Math.min(max, current + step);
}

export function isRitualComplete(progress: number, max = RITUAL_MAX): boolean {
  return progress >= max;
}
