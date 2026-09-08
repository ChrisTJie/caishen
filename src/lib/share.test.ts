import { describe, expect, it } from 'vitest';
import { formatShareText } from './share';

describe('formatShareText', () => {
  it('includes fortune and multiple sets', () => {
    const text = formatShareText({
      gameName: '大樂透',
      sets: [
        { zoneA: [1, 2, 3, 4, 5, 6] },
        { zoneA: [7, 8, 9, 10, 11, 12] },
      ],
      fortune: { title: '金馬奔騰', level: '大吉' },
    });
    expect(text).toContain('甲組');
    expect(text).toContain('靈籤：金馬奔騰（大吉）');
    expect(text).toContain('僅供娛樂參考');
  });
});
