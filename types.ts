export type LotteryType = 'bigLotto' | 'powerLottery' | '539';

export interface LotteryConfig {
  id: LotteryType;
  name: string;
  zoneA: {
    min: number;
    max: number;
    count: number;
  };
  zoneB?: {
    min: number;
    max: number;
    count: number;
  };
  color: string;
}

export interface GeneratedNumbers {
  zoneA: number[];
  zoneB?: number[];
  source: 'random';
  timestamp: number;
}
