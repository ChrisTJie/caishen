import { describe, expect, it } from 'vitest';
import { parsePresets, serializePresets } from './presets';

describe('custom presets', () => {
  it('parses valid presets and ignores junk', () => {
    const raw = JSON.stringify([
      { id: '1', name: '大樂透', min: 1, max: 49, count: 6 },
      { id: 2, name: 'bad' },
    ]);
    expect(parsePresets(raw)).toEqual([{ id: '1', name: '大樂透', min: 1, max: 49, count: 6 }]);
  });

  it('round-trips presets', () => {
    const items = [{ id: 'a', name: '今彩', min: 1, max: 39, count: 5 }];
    expect(parsePresets(serializePresets(items))).toEqual(items);
  });
});
