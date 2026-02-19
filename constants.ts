import { LotteryConfig } from './types';

export const LOTTERY_GAMES: Record<string, LotteryConfig> = {
  bigLotto: {
    id: 'bigLotto',
    name: '大樂透',
    zoneA: { min: 1, max: 49, count: 6 },
    color: 'from-yellow-400 to-yellow-600', // Gold
  },
  powerLottery: {
    id: 'powerLottery',
    name: '威力彩',
    zoneA: { min: 1, max: 38, count: 6 },
    zoneB: { min: 1, max: 8, count: 1 },
    color: 'from-green-400 to-green-600', // Greenish Gold
  },
  daily539: {
    id: '539',
    name: '今彩 539',
    zoneA: { min: 1, max: 39, count: 5 },
    color: 'from-purple-400 to-purple-600', // Purple Gold
  },
};
