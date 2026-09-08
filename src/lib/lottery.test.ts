import { describe, expect, it } from 'vitest';
import {
  countHits,
  generateDraw,
  generateDrawSets,
  parseNumberList,
  pickUnique,
  validateCustomRange,
} from './lottery';

describe('pickUnique', () => {
  it('returns the requested count of sorted unique numbers in range', () => {
    const result = pickUnique(1, 49, 6);
    expect(result).toHaveLength(6);
    expect(new Set(result).size).toBe(6);
    expect([...result].sort((a, b) => a - b)).toEqual(result);
    expect(result.every((n) => n >= 1 && n <= 49)).toBe(true);
  });

  it('returns an empty array when count is 0', () => {
    expect(pickUnique(1, 10, 0)).toEqual([]);
  });

  it('returns the full range when count equals range size', () => {
    expect(pickUnique(3, 5, 3)).toEqual([3, 4, 5]);
  });

  it('throws when max is below min', () => {
    expect(() => pickUnique(10, 1, 2)).toThrow(/最大值/);
  });

  it('throws when count exceeds range', () => {
    expect(() => pickUnique(1, 5, 6)).toThrow(/超過/);
  });
});

describe('generateDraw', () => {
  it('fills zone B when provided', () => {
    const draw = generateDraw({ min: 1, max: 10, count: 3 }, { min: 1, max: 4, count: 1 });
    expect(draw.zoneA).toHaveLength(3);
    expect(draw.zoneB).toHaveLength(1);
  });
});

describe('generateDrawSets', () => {
  it('returns the requested number of independent draws', () => {
    const sets = generateDrawSets({ min: 1, max: 39, count: 5 }, undefined, 5);
    expect(sets).toHaveLength(5);
    sets.forEach((set) => {
      expect(set.zoneA).toHaveLength(5);
      expect(new Set(set.zoneA).size).toBe(5);
    });
  });
});

describe('parseNumberList and countHits', () => {
  it('parses mixed separators and ignores duplicates', () => {
    expect(parseNumberList('01, 12，18 18、22')).toEqual([1, 12, 18, 22]);
  });

  it('counts matching numbers', () => {
    expect(countHits([1, 2, 3, 4], [3, 8, 1])).toBe(2);
  });
});

describe('validateCustomRange', () => {
  it('rejects invalid ranges', () => {
    expect(validateCustomRange(10, 10, 1)).toMatch(/最大值/);
    expect(validateCustomRange(1, 5, 0)).toMatch(/正整數/);
    expect(validateCustomRange(1, 5, 6)).toMatch(/超過/);
  });

  it('accepts a valid range', () => {
    expect(validateCustomRange(1, 49, 6)).toBeNull();
  });
});
