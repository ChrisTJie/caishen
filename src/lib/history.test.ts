import { describe, expect, it } from 'vitest';
import { parseHistory, serializeHistory } from './history';

describe('history serialization', () => {
  it('returns an empty list for invalid JSON', () => {
    expect(parseHistory('{not json')).toEqual([]);
    expect(parseHistory(null)).toEqual([]);
    expect(parseHistory('{}')).toEqual([]);
  });

  it('migrates legacy zoneA records into sets', () => {
    const raw = JSON.stringify([
      {
        id: 'abc',
        gameName: '大樂透',
        zoneA: [1, 2, 3, 4, 5, 6],
        zoneB: [7],
        timestamp: 123,
        source: 'random',
      },
    ]);
    const parsed = parseHistory(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].sets).toEqual([{ zoneA: [1, 2, 3, 4, 5, 6], zoneB: [7] }]);
  });

  it('round-trips current records and keeps fortune fields', () => {
    const items = [
      {
        id: 'id-1',
        gameName: '今彩 539',
        timestamp: 456,
        source: 'random' as const,
        sets: [{ zoneA: [3, 9, 12, 18, 21] }],
        fortuneTitle: '金馬奔騰',
        fortuneLevel: '大吉' as const,
      },
    ];
    const parsed = parseHistory(serializeHistory(items));
    expect(parsed).toEqual(items);
  });

  it('drops records that have no numbers', () => {
    expect(parseHistory(JSON.stringify([{ id: 'x', gameName: 'x' }]))).toEqual([]);
  });
});
