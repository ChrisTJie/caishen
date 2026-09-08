export type LotteryType = 'bigLotto' | 'powerLottery' | '539';

export type FortuneLevel = '大吉' | '中吉' | '小吉' | '吉';

export interface NumberRange {
  min: number;
  max: number;
  count: number;
}

export interface LotteryConfig {
  id: LotteryType;
  name: string;
  zoneA: NumberRange;
  zoneB?: NumberRange;
  color: string;
  description: string;
}

export interface NumberSet {
  zoneA: number[];
  zoneB?: number[];
}

export interface GeneratedNumbers extends NumberSet {
  source: 'random';
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  gameName: string;
  timestamp: number;
  source: 'random';
  sets: NumberSet[];
  fortuneTitle?: string;
  fortuneLevel?: FortuneLevel;
}

export interface FortunePoem {
  level: FortuneLevel;
  title: string;
  poem: string[];
  blessing: string;
}

export interface CustomPreset {
  id: string;
  name: string;
  min: number;
  max: number;
  count: number;
}
