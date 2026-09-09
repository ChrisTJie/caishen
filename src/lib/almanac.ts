import { Solar } from 'lunar-typescript';
import { parseYmd, SHICHEN_PERIODS } from './shichen';

export type TianShenPath = '黃道' | '黑道';
export type TianShenLuck = '吉' | '凶';

export interface TianShenConsideration {
  office: string;
  yi: readonly string[];
  ji: readonly string[];
  note: string;
}

export interface TianShenMark extends TianShenConsideration {
  name: string;
  path: TianShenPath;
  luck: TianShenLuck;
}

export interface AlmanacDay {
  ymd: string;
  lunarDate: string;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  yearGanZhiByLiChun: string;
  yearShengXiao: string;
  yearShengXiaoByLiChun: string;
  weekday: string;
  jieQi: string | null;
  festivals: string[];
  dayZhi: string;
  tianShenByBranch: Record<string, TianShenMark>;
  lichunYearDiffers: boolean;
}

const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

const TIAN_SHEN_TW = [
  '',
  '青龍',
  '明堂',
  '天刑',
  '朱雀',
  '金匱',
  '天德',
  '白虎',
  '玉堂',
  '天牢',
  '玄武',
  '司命',
  '勾陳',
] as const;

const MONTH_TW = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '臘'] as const;

const SHENGXIAO_TW = ['', '鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'] as const;

const WEEKDAY_TW = ['日', '一', '二', '三', '四', '五', '六'] as const;

/** 日支 → 十二天神起始偏移（子時起算）。 */
export const TIAN_SHEN_OFFSET: Record<string, number> = {
  子: 4,
  丑: 2,
  寅: 0,
  卯: 10,
  辰: 8,
  巳: 6,
  午: 4,
  未: 2,
  申: 0,
  酉: 10,
  戌: 8,
  亥: 6,
};

const HUANG_DAO_NAMES = new Set<string>(['青龍', '明堂', '金匱', '天德', '玉堂', '司命']);

type TianShenName = Exclude<(typeof TIAN_SHEN_TW)[number], ''>;

/** 十二天神傳統職司與常見擇時宜忌；各家通書措辭可能不同。 */
export const TIAN_SHEN_CONSIDERATION: Record<TianShenName, TianShenConsideration> = {
  青龍: {
    office: '財祿、喜慶',
    yi: ['祭祀', '嫁娶', '開市', '求財', '出行'],
    ji: [],
    note: '天乙貴神，諸事可為，所作較順。',
  },
  明堂: {
    office: '明智、貴人',
    yi: ['見貴', '議事', '入宅', '開市'],
    ji: [],
    note: '貴人星，宜見貴議事，百事較宜。',
  },
  天刑: {
    office: '刑罰、爭訟',
    yi: [],
    ji: ['興訟', '動刑', '詞訟', '妄動'],
    note: '天刑星，大忌詞訟；其餘謀為多不宜。',
  },
  朱雀: {
    office: '口舌、是非',
    yi: [],
    ji: ['口角', '詞訟', '簽約', '開張'],
    note: '主口舌是非，忌爭辯與文書糾紛。',
  },
  金匱: {
    office: '財富、婚姻和合',
    yi: ['嫁娶', '納財', '開市', '立券', '入宅'],
    ji: [],
    note: '財帛星，利開張、求財與婚配。',
  },
  天德: {
    office: '福德、解厄',
    yi: ['祭祀', '祈福', '開市', '出行', '嫁娶'],
    ji: [],
    note: '福德星，化解力較強，百事較宜。',
  },
  白虎: {
    office: '血光、喪事',
    yi: [],
    ji: ['動土', '出行', '安葬', '嫁娶'],
    note: '凶神，忌動土、遠行與喜慶之事。',
  },
  玉堂: {
    office: '貴人、文書',
    yi: ['文書', '上任', '見貴', '嫁娶', '開市'],
    ji: ['泥灶'],
    note: '少微星，宜文書喜慶、上任見貴；不利泥灶。',
  },
  天牢: {
    office: '幽禁、闇昧',
    yi: [],
    ji: ['遠行', '決斷', '詞訟', '開張'],
    note: '主牢獄闇昧，忌遠行與重大決斷。',
  },
  玄武: {
    office: '盜失、口舌',
    yi: [],
    ji: ['託財', '開張', '交易', '出行'],
    note: '主盜賊口舌，忌託付財物與開張。',
  },
  司命: {
    office: '福壽、灶事',
    yi: ['祭祀', '祈福', '修灶'],
    ji: ['詞訟'],
    note: '宜祭祀求福、修灶；忌詞訟。',
  },
  勾陳: {
    office: '田土牽連',
    yi: [],
    ji: ['田產', '詞訟', '動土', '開張'],
    note: '主田土牽連，忌田產與未了糾紛。',
  },
};

export function tianShenConsideration(name: string): TianShenConsideration | null {
  return Object.hasOwn(TIAN_SHEN_CONSIDERATION, name)
    ? TIAN_SHEN_CONSIDERATION[name as TianShenName]
    : null;
}

const SIMPLIFIED_CHARS: Record<string, string> = {
  龙: '龍',
  鸡: '雞',
  马: '馬',
  猪: '豬',
  腊: '臘',
  闰: '閏',
  匮: '匱',
  陈: '陳',
  黄: '黃',
  节: '節',
  阳: '陽',
  惊: '驚',
  蛰: '蟄',
  谷: '穀',
  满: '滿',
  种: '種',
  处: '處',
};

export function toTraditional(value: string): string {
  return Array.from(value, (char) => SIMPLIFIED_CHARS[char] ?? char).join('');
}

export function tianShenFor(dayZhi: string, timeZhi: string): TianShenMark | null {
  const zhiIndex = ZHI.indexOf(timeZhi as (typeof ZHI)[number]) + 1;
  const offset = TIAN_SHEN_OFFSET[dayZhi];
  if (zhiIndex < 1 || offset == null) return null;

  let index = (zhiIndex + offset) % 12;
  if (index === 0) index = 12;

  const name = TIAN_SHEN_TW[index];
  const consideration = tianShenConsideration(name);
  if (!name || !consideration) return null;

  const path: TianShenPath = HUANG_DAO_NAMES.has(name) ? '黃道' : '黑道';
  return {
    name,
    path,
    luck: path === '黃道' ? '吉' : '凶',
    ...consideration,
  };
}

function shengXiaoForZhi(zhi: string): string {
  const index = ZHI.indexOf(zhi as (typeof ZHI)[number]) + 1;
  return index > 0 ? SHENGXIAO_TW[index] : toTraditional(zhi);
}

export function getAlmanacDay(ymd: string): AlmanacDay | null {
  const parsed = parseYmd(ymd);
  if (!parsed) return null;

  const solar = Solar.fromYmd(parsed.year, parsed.month, parsed.day);
  const lunar = solar.getLunar();
  const dayZhi = lunar.getDayZhi();
  const yearZhi = lunar.getYearZhi();
  const yearZhiLiChun = lunar.getYearZhiByLiChun();
  const monthAbs = Math.abs(lunar.getMonth());
  const monthName = MONTH_TW[monthAbs] ?? String(monthAbs);
  const lunarDate = `農曆${lunar.getYearInChinese()}年${lunar.getMonth() < 0 ? '閏' : ''}${monthName}月${lunar.getDayInChinese()}`;
  const jieQiRaw = lunar.getJieQi();
  const yearGanZhi = lunar.getYearInGanZhi();
  const yearGanZhiByLiChun = lunar.getYearInGanZhiByLiChun();

  const tianShenByBranch: Record<string, TianShenMark> = {};
  for (const period of SHICHEN_PERIODS) {
    const mark = tianShenFor(dayZhi, period.branch);
    if (mark) tianShenByBranch[period.branch] = mark;
  }

  const festivals = [...lunar.getFestivals(), ...lunar.getOtherFestivals()]
    .map((name) => toTraditional(name))
    .filter((name) => name.length > 0);

  return {
    ymd,
    lunarDate,
    yearGanZhi,
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
    yearGanZhiByLiChun,
    yearShengXiao: shengXiaoForZhi(yearZhi),
    yearShengXiaoByLiChun: shengXiaoForZhi(yearZhiLiChun),
    weekday: `星期${WEEKDAY_TW[solar.getWeek()] ?? ''}`,
    jieQi: jieQiRaw ? toTraditional(jieQiRaw) : null,
    festivals,
    dayZhi,
    tianShenByBranch,
    lichunYearDiffers: yearGanZhi !== yearGanZhiByLiChun,
  };
}
