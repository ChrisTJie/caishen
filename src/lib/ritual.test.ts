import { describe, expect, it } from 'vitest';
import { isRitualComplete, tickRitualProgress } from './ritual';

describe('ritual progress', () => {
  it('advances until the maximum', () => {
    expect(tickRitualProgress(98, 2, 100)).toBe(100);
    expect(tickRitualProgress(100, 2, 100)).toBe(100);
  });

  it('treats reaching max as complete', () => {
    expect(isRitualComplete(99)).toBe(false);
    expect(isRitualComplete(100)).toBe(true);
  });
});
