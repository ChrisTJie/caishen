import { describe, expect, it } from 'vitest';
import { getAlmanacDay, tianShenFor, toTraditional } from './almanac';
import { SHICHEN_PERIODS } from './shichen';

describe('toTraditional', () => {
  it('converts known simplified calendar characters', () => {
    expect(toTraditional('春节')).toBe('春節');
    expect(toTraditional('惊蛰')).toBe('驚蟄');
    expect(toTraditional('龙')).toBe('龍');
  });
});

describe('tianShenFor', () => {
  it('matches the common 日支輪值表 for 辰日', () => {
    expect(tianShenFor('辰', '子')).toEqual({ name: '天牢', path: '黑道', luck: '凶' });
    expect(tianShenFor('辰', '寅')).toEqual({ name: '司命', path: '黃道', luck: '吉' });
    expect(tianShenFor('辰', '辰')).toEqual({ name: '青龍', path: '黃道', luck: '吉' });
    expect(tianShenFor('辰', '午')).toEqual({ name: '天刑', path: '黑道', luck: '凶' });
    expect(tianShenFor('辰', '申')).toEqual({ name: '金匱', path: '黃道', luck: '吉' });
  });

  it('returns six 黃道吉 and six 黑道凶 for any day branch', () => {
    const marks = SHICHEN_PERIODS.map((period) => tianShenFor('卯', period.branch));
    expect(marks.every(Boolean)).toBe(true);
    expect(marks.filter((mark) => mark?.luck === '吉')).toHaveLength(6);
    expect(marks.filter((mark) => mark?.luck === '凶')).toHaveLength(6);
  });
});

describe('getAlmanacDay', () => {
  it('returns null for an invalid date', () => {
    expect(getAlmanacDay('2026-02-31')).toBeNull();
  });

  it('describes 2024-02-10 as 春節甲辰正月初一', () => {
    const day = getAlmanacDay('2024-02-10');
    expect(day).not.toBeNull();
    expect(day?.lunarDate).toBe('農曆二〇二四年正月初一');
    expect(day?.yearGanZhi).toBe('甲辰');
    expect(day?.yearShengXiao).toBe('龍');
    expect(day?.monthGanZhi).toBe('丙寅');
    expect(day?.dayGanZhi).toBe('甲辰');
    expect(day?.weekday).toBe('星期六');
    expect(day?.festivals).toContain('春節');
    expect(day?.dayZhi).toBe('辰');
    expect(day?.tianShenByBranch.子).toEqual({ name: '天牢', path: '黑道', luck: '凶' });
    expect(day?.tianShenByBranch.午).toEqual({ name: '天刑', path: '黑道', luck: '凶' });
    expect(Object.keys(day?.tianShenByBranch ?? {})).toHaveLength(12);
  });

  it('labels a leap month in Traditional Chinese', () => {
    const day = getAlmanacDay('2023-03-22');
    expect(day?.lunarDate).toBe('農曆二〇二三年閏二月初一');
  });

  it('flags when the 立春 year pillar differs from the lunar year', () => {
    const day = getAlmanacDay('2024-02-04');
    expect(day?.jieQi).toBe('立春');
    expect(day?.yearGanZhi).toBe('癸卯');
    expect(day?.yearShengXiao).toBe('兔');
    expect(day?.yearGanZhiByLiChun).toBe('甲辰');
    expect(day?.yearShengXiaoByLiChun).toBe('龍');
    expect(day?.lichunYearDiffers).toBe(true);
  });
});
