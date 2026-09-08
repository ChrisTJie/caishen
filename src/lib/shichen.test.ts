import { describe, expect, it } from 'vitest';
import {
  BOUNDARY_WARNING_MINUTES,
  buildShichenTable,
  clockToSolarMinute,
  dayOfYear,
  equationOfTimeMinutes,
  findShichen,
  formatMinuteOfDay,
  formatMinuteRange,
  formatSignedMinutes,
  getTaipeiDateTime,
  isMinuteInPeriod,
  longitudeOffsetMinutes,
  minutesToNextBoundary,
  parseYmd,
  SHICHEN_PERIODS,
  solarToClockMinute,
  wrapMinuteOfDay,
} from './shichen';

describe('parseYmd', () => {
  it('accepts a valid calendar date', () => {
    expect(parseYmd('2026-09-08')).toEqual({ year: 2026, month: 9, day: 8 });
  });

  it('rejects impossible dates', () => {
    expect(parseYmd('2026-02-31')).toBeNull();
    expect(parseYmd('2026/09/08')).toBeNull();
  });
});

describe('shichen ranges', () => {
  it('maps noon to 午時 and late night to 子時', () => {
    expect(findShichen(12 * 60).name).toBe('午時');
    expect(findShichen(23 * 60 + 30).name).toBe('子時');
    expect(findShichen(30).name).toBe('子時');
  });

  it('treats the end minute as the start of the next period', () => {
    expect(findShichen(13 * 60).name).toBe('未時');
    expect(findShichen(1 * 60).name).toBe('丑時');
  });

  it('covers every minute of the day exactly once', () => {
    const ids = new Set(SHICHEN_PERIODS.map((period) => period.id));
    expect(ids.size).toBe(12);
    for (let minute = 0; minute < 24 * 60; minute += 1) {
      const hits = SHICHEN_PERIODS.filter((period) => isMinuteInPeriod(minute, period));
      expect(hits).toHaveLength(1);
    }
  });
});

describe('solar offset', () => {
  it('adds four minutes per degree east of 120', () => {
    expect(longitudeOffsetMinutes(121.56)).toBeCloseTo(6.24, 5);
    expect(longitudeOffsetMinutes(120.31)).toBeCloseTo(1.24, 5);
  });

  it('is strongly negative in early February and positive in early November', () => {
    expect(equationOfTimeMinutes(2026, 2, 11)).toBeLessThan(-10);
    expect(equationOfTimeMinutes(2026, 2, 11)).toBeGreaterThan(-16);
    expect(equationOfTimeMinutes(2026, 11, 3)).toBeGreaterThan(14);
    expect(equationOfTimeMinutes(2026, 11, 3)).toBeLessThan(17);
  });

  it('converts clock time to true solar time with wrap', () => {
    expect(clockToSolarMinute(23 * 60 + 50, 20)).toBe(10);
    expect(solarToClockMinute(10, 20)).toBe(23 * 60 + 50);
  });
});

describe('buildShichenTable', () => {
  it('builds twelve rows and shifts the solar clock window by the offset', () => {
    const table = buildShichenTable({
      ymd: '2026-11-03',
      cityId: 'taipei',
      now: new Date('2026-01-01T00:00:00Z'),
    });
    expect(table).not.toBeNull();
    expect(table?.rows).toHaveLength(12);
    expect(table?.isToday).toBe(false);
    const wu = table?.rows.find((row) => row.period.id === 'wu');
    expect(wu?.clockLabel).toBe('11:00–13:00');
    const offset = table?.totalOffsetMinutes ?? 0;
    expect(wu?.solarClockLabel).toBe(
      formatMinuteRange(solarToClockMinute(11 * 60, offset), solarToClockMinute(13 * 60, offset)),
    );
  });

  it('marks the current clock and solar periods on today', () => {
    const now = new Date('2026-09-08T04:00:00Z');
    const taipei = getTaipeiDateTime(now);
    const table = buildShichenTable({
      ymd: taipei.ymd,
      cityId: 'taipei',
      now,
    });
    expect(table?.isToday).toBe(true);
    expect(table?.clockPeriodId).toBe(findShichen(taipei.minuteOfDay).id);
    const current = table?.rows.find((row) => row.isClockNow);
    expect(current?.period.id).toBe(table?.clockPeriodId);
  });
});

describe('helpers', () => {
  it('formats signed minutes and wrapped clock labels', () => {
    expect(formatSignedMinutes(6.24)).toBe('+6.2 分');
    expect(formatSignedMinutes(-6.21)).toBe('−6.2 分');
    expect(formatSignedMinutes(0.04)).toBe('0.0 分');
    expect(formatMinuteOfDay(wrapMinuteOfDay(-5))).toBe('23:55');
    expect(dayOfYear(2026, 1, 1)).toBe(1);
    expect(dayOfYear(2026, 12, 31)).toBe(365);
  });

  it('reports distance to the nearer period boundary', () => {
    const wu = findShichen(12 * 60);
    expect(minutesToNextBoundary(12 * 60, wu)).toBe(60);
    expect(minutesToNextBoundary(11 * 60 + 10, wu)).toBe(10);
    expect(minutesToNextBoundary(12 * 60 + 50, wu) <= BOUNDARY_WARNING_MINUTES).toBe(true);
  });
});
