export const TAIPEI_TIME_ZONE = 'Asia/Taipei';
export const STANDARD_MERIDIAN_EAST = 120;
export const MINUTES_PER_DAY = 24 * 60;
export const BOUNDARY_WARNING_MINUTES = 20;

export interface TaiwanCity {
  id: string;
  name: string;
  longitude: number;
}

export const TAIWAN_CITIES: readonly TaiwanCity[] = [
  { id: 'taipei', name: '台北', longitude: 121.56 },
  { id: 'taichung', name: '台中', longitude: 120.68 },
  { id: 'kaohsiung', name: '高雄', longitude: 120.31 },
] as const;

export const DEFAULT_CITY_ID = 'taipei';

export interface ShichenPeriod {
  id: string;
  name: string;
  branch: string;
  animal: string;
  startMin: number;
  endMin: number;
}

export const SHICHEN_PERIODS: readonly ShichenPeriod[] = [
  { id: 'zi', name: '子時', branch: '子', animal: '鼠', startMin: 23 * 60, endMin: 1 * 60 },
  { id: 'chou', name: '丑時', branch: '丑', animal: '牛', startMin: 1 * 60, endMin: 3 * 60 },
  { id: 'yin', name: '寅時', branch: '寅', animal: '虎', startMin: 3 * 60, endMin: 5 * 60 },
  { id: 'mao', name: '卯時', branch: '卯', animal: '兔', startMin: 5 * 60, endMin: 7 * 60 },
  { id: 'chen', name: '辰時', branch: '辰', animal: '龍', startMin: 7 * 60, endMin: 9 * 60 },
  { id: 'si', name: '巳時', branch: '巳', animal: '蛇', startMin: 9 * 60, endMin: 11 * 60 },
  { id: 'wu', name: '午時', branch: '午', animal: '馬', startMin: 11 * 60, endMin: 13 * 60 },
  { id: 'wei', name: '未時', branch: '未', animal: '羊', startMin: 13 * 60, endMin: 15 * 60 },
  { id: 'shen', name: '申時', branch: '申', animal: '猴', startMin: 15 * 60, endMin: 17 * 60 },
  { id: 'you', name: '酉時', branch: '酉', animal: '雞', startMin: 17 * 60, endMin: 19 * 60 },
  { id: 'xu', name: '戌時', branch: '戌', animal: '狗', startMin: 19 * 60, endMin: 21 * 60 },
  { id: 'hai', name: '亥時', branch: '亥', animal: '豬', startMin: 21 * 60, endMin: 23 * 60 },
] as const;

export interface TaipeiDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  ymd: string;
  minuteOfDay: number;
}

export interface ShichenRowView {
  period: ShichenPeriod;
  clockLabel: string;
  solarClockLabel: string;
  isClockNow: boolean;
  isSolarNow: boolean;
}

export interface ShichenTable {
  ymd: string;
  city: TaiwanCity;
  equationOfTimeMinutes: number;
  longitudeOffsetMinutes: number;
  totalOffsetMinutes: number;
  rows: ShichenRowView[];
  clockPeriodId: string | null;
  solarPeriodId: string | null;
  nearBoundary: boolean;
  clockDiffersFromSolar: boolean;
  isToday: boolean;
}

export function wrapMinuteOfDay(minutes: number): number {
  return ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function formatMinuteOfDay(minutes: number): string {
  const wrapped = wrapMinuteOfDay(minutes);
  const hour = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatMinuteRange(startMin: number, endMin: number): string {
  return `${formatMinuteOfDay(startMin)}–${formatMinuteOfDay(endMin)}`;
}

export function isMinuteInPeriod(minuteOfDay: number, period: ShichenPeriod): boolean {
  const m = wrapMinuteOfDay(minuteOfDay);
  if (period.startMin === period.endMin) return true;
  if (period.startMin > period.endMin) {
    return m >= period.startMin || m < period.endMin;
  }
  return m >= period.startMin && m < period.endMin;
}

export function findShichen(minuteOfDay: number): ShichenPeriod {
  const found = SHICHEN_PERIODS.find((period) => isMinuteInPeriod(minuteOfDay, period));
  return found ?? SHICHEN_PERIODS[0];
}

export function minutesToNextBoundary(minuteOfDay: number, period: ShichenPeriod): number {
  const m = wrapMinuteOfDay(minuteOfDay);
  const toEnd = wrapMinuteOfDay(period.endMin - m);
  const fromStart = wrapMinuteOfDay(m - period.startMin);
  return Math.min(toEnd, fromStart);
}

export function dayOfYear(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 0, 1);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86_400_000) + 1;
}

/** NOAA approximation; result is minutes to add to mean solar time to get apparent (true) solar time. */
export function equationOfTimeMinutes(year: number, month: number, day: number, hour = 12): number {
  const n = dayOfYear(year, month, day);
  const gamma = (2 * Math.PI) / 365 * (n - 1 + (hour - 12) / 24);
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))
  );
}

export function longitudeOffsetMinutes(longitudeEast: number): number {
  return (longitudeEast - STANDARD_MERIDIAN_EAST) * 4;
}

export function solarOffsetMinutes(year: number, month: number, day: number, longitudeEast: number): number {
  return longitudeOffsetMinutes(longitudeEast) + equationOfTimeMinutes(year, month, day);
}

export function clockToSolarMinute(clockMinuteOfDay: number, offsetMinutes: number): number {
  return wrapMinuteOfDay(clockMinuteOfDay + offsetMinutes);
}

export function solarToClockMinute(solarMinuteOfDay: number, offsetMinutes: number): number {
  return wrapMinuteOfDay(solarMinuteOfDay - offsetMinutes);
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function toYmd(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseYmd(ymd: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function getTaipeiDateTime(at: Date = new Date()): TaipeiDateTime {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TAIPEI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');

  const year = read('year');
  const month = read('month');
  const day = read('day');
  const hour = read('hour');
  const minute = read('minute');

  return {
    year,
    month,
    day,
    hour,
    minute,
    ymd: toYmd(year, month, day),
    minuteOfDay: hour * 60 + minute,
  };
}

export function findCity(cityId: string): TaiwanCity {
  return TAIWAN_CITIES.find((city) => city.id === cityId) ?? TAIWAN_CITIES[0];
}

export function buildShichenTable(options: {
  ymd: string;
  cityId: string;
  now?: Date;
}): ShichenTable | null {
  const parsed = parseYmd(options.ymd);
  if (!parsed) return null;

  const city = findCity(options.cityId);
  const offset = solarOffsetMinutes(parsed.year, parsed.month, parsed.day, city.longitude);
  const eot = equationOfTimeMinutes(parsed.year, parsed.month, parsed.day);
  const lonOffset = longitudeOffsetMinutes(city.longitude);
  const nowParts = getTaipeiDateTime(options.now ?? new Date());
  const isToday = nowParts.ymd === options.ymd;
  const clockMinute = isToday ? nowParts.minuteOfDay : null;
  const solarMinute = clockMinute == null ? null : clockToSolarMinute(clockMinute, offset);
  const clockPeriod = clockMinute == null ? null : findShichen(clockMinute);
  const solarPeriod = solarMinute == null ? null : findShichen(solarMinute);
  const nearBoundary =
    clockPeriod != null &&
    clockMinute != null &&
    minutesToNextBoundary(clockMinute, clockPeriod) <= BOUNDARY_WARNING_MINUTES;

  const rows: ShichenRowView[] = SHICHEN_PERIODS.map((period) => ({
    period,
    clockLabel: formatMinuteRange(period.startMin, period.endMin),
    solarClockLabel: formatMinuteRange(
      solarToClockMinute(period.startMin, offset),
      solarToClockMinute(period.endMin, offset),
    ),
    isClockNow: clockPeriod?.id === period.id,
    isSolarNow: solarPeriod?.id === period.id,
  }));

  return {
    ymd: options.ymd,
    city,
    equationOfTimeMinutes: eot,
    longitudeOffsetMinutes: lonOffset,
    totalOffsetMinutes: offset,
    rows,
    clockPeriodId: clockPeriod?.id ?? null,
    solarPeriodId: solarPeriod?.id ?? null,
    nearBoundary,
    clockDiffersFromSolar: Boolean(clockPeriod && solarPeriod && clockPeriod.id !== solarPeriod.id),
    isToday,
  };
}

export function formatSignedMinutes(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const abs = Math.abs(rounded).toFixed(1);
  if (rounded > 0) return `+${abs} 分`;
  if (rounded < 0) return `−${abs} 分`;
  return '0.0 分';
}
