import { describe, expect, it } from 'vitest';
import { getAlmanacDay, tianShenConsideration, tianShenFor, TIAN_SHEN_CONSIDERATION, toTraditional } from './almanac';
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
    expect(tianShenFor('辰', '子')).toEqual(
      expect.objectContaining({ name: '天牢', path: '黑道', luck: '凶' }),
    );
    expect(tianShenFor('辰', '寅')).toEqual(
      expect.objectContaining({ name: '司命', path: '黃道', luck: '吉' }),
    );
    expect(tianShenFor('辰', '辰')).toEqual(
      expect.objectContaining({ name: '青龍', path: '黃道', luck: '吉' }),
    );
    expect(tianShenFor('辰', '午')).toEqual(
      expect.objectContaining({ name: '天刑', path: '黑道', luck: '凶' }),
    );
    expect(tianShenFor('辰', '申')).toEqual(
      expect.objectContaining({ name: '金匱', path: '黃道', luck: '吉' }),
    );
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
    expect(day?.tianShenByBranch.子).toEqual(
      expect.objectContaining({ name: '天牢', path: '黑道', luck: '凶' }),
    );
    expect(day?.tianShenByBranch.午).toEqual(
      expect.objectContaining({ name: '天刑', path: '黑道', luck: '凶' }),
    );
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

describe('tianShenConsideration', () => {
  it('covers all twelve gods with traditional 宜忌 notes', () => {
    const names = Object.keys(TIAN_SHEN_CONSIDERATION);
    expect(names).toHaveLength(12);
    for (const name of names) {
      const item = tianShenConsideration(name);
      expect(item?.office.length).toBeGreaterThan(0);
      expect(item?.note.length).toBeGreaterThan(0);
      expect(item && item.yi.length + item.ji.length).toBeGreaterThan(0);
    }
  });

  it('gives 黃道 gods auspicious acts and 黑道 gods taboos', () => {
    expect(tianShenConsideration('青龍')?.yi).toEqual(
      expect.arrayContaining(['祭祀', '嫁娶', '開市', '求財']),
    );
    expect(tianShenConsideration('天刑')?.ji).toEqual(expect.arrayContaining(['興訟', '詞訟']));
    expect(tianShenConsideration('司命')?.ji).toContain('詞訟');
    expect(tianShenConsideration('玉堂')?.ji).toContain('泥灶');
    expect(tianShenConsideration('白虎')?.ji).toEqual(expect.arrayContaining(['動土', '出行']));
  });

  it('attaches consideration text when resolving a 時辰 mark', () => {
    const siMing = tianShenFor('辰', '寅');
    expect(siMing?.name).toBe('司命');
    expect(siMing?.office).toBe('福壽、灶事');
    expect(siMing?.yi).toEqual(expect.arrayContaining(['祭祀', '修灶']));
    expect(siMing?.ji).toContain('詞訟');
    expect(siMing?.note).toContain('忌詞訟');
  });

  it('returns null for an unknown god name', () => {
    expect(tianShenConsideration('建星')).toBeNull();
  });
});
