import type { NumberRange, NumberSet } from '../types';

export function pickUnique(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(count)) {
    throw new Error('範圍必須是有限數字');
  }

  const lo = Math.trunc(min);
  const hi = Math.trunc(max);
  const n = Math.trunc(count);

  if (hi < lo) {
    throw new Error('最大值必須大於或等於最小值');
  }
  if (n < 0) {
    throw new Error('選號個數不可為負');
  }

  const rangeSize = hi - lo + 1;
  if (n > rangeSize) {
    throw new Error('選號個數不可超過號碼範圍');
  }
  if (n === 0) return [];

  const pool = Array.from({ length: rangeSize }, (_, i) => lo + i);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (rangeSize - i));
    const swap = pool[i];
    pool[i] = pool[j];
    pool[j] = swap;
  }

  return pool.slice(0, n).sort((a, b) => a - b);
}

export function generateDraw(zoneA: NumberRange, zoneB?: NumberRange): NumberSet {
  return {
    zoneA: pickUnique(zoneA.min, zoneA.max, zoneA.count),
    zoneB: zoneB ? pickUnique(zoneB.min, zoneB.max, zoneB.count) : undefined,
  };
}

export function writeNumberSet(set: NumberSet, digits: Array<HTMLSpanElement | null>) {
  const numbers = [...set.zoneA, ...(set.zoneB ?? [])];
  numbers.forEach((value, index) => {
    const node = digits[index];
    if (node) node.textContent = String(value).padStart(2, '0');
  });
}

export function generateDrawSets(
  zoneA: NumberRange,
  zoneB: NumberRange | undefined,
  setCount: number,
): NumberSet[] {
  const n = Math.max(1, Math.trunc(setCount));
  return Array.from({ length: n }, () => generateDraw(zoneA, zoneB));
}

export function parseNumberList(input: string): number[] {
  const values = input
    .split(/[,，、\s]+/)
    .map((part) => Number.parseInt(part, 10))
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(values)];
}

export function countHits(picked: number[], drawn: number[]): number {
  const winning = new Set(drawn);
  return picked.filter((n) => winning.has(n)).length;
}

export function validateCustomRange(min: number, max: number, count: number): string | null {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(count)) {
    return '請輸入有效數字';
  }
  if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isInteger(count)) {
    return '號碼與個數須為整數';
  }
  if (max <= min) {
    return '最大值須大於最小值';
  }
  if (count <= 0) {
    return '選號個數須為正整數';
  }
  if (count > max - min + 1) {
    return '選號個數不可超過號碼範圍';
  }
  return null;
}
