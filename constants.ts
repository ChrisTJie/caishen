import { LotteryConfig, FortunePoem } from './types';

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

export const POEMS: FortunePoem[] = [
  {
    level: '大吉',
    title: '金馬奔騰',
    poem: ['嘉禾連理瑞雲生', '萬里騰驤步錦程', '財星遠耀輝煌處', '富貴榮華自此萌'],
    blessing: '大吉大利，財源廣進。'
  },
  {
    level: '中吉',
    title: '利見大人',
    poem: ['雲開見日影偏長', '萬物咸亨景象昌', '貴人指引趨發達', '從今百事盡嘉祥'],
    blessing: '諸事順遂，貴人扶助。'
  },
  {
    level: '小吉',
    title: '守得雲開',
    poem: ['一枝紅杏出牆邊', '恰逢春色正鮮妍', '雖然不是真富貴', '也勝清閒過幾年'],
    blessing: '漸入佳境，耐心守候。'
  },
  {
    level: '吉',
    title: '平安自福',
    poem: ['心中無礙自逍遙', '不必煩勞問野橋', '但管自家勤與謹', '福緣深厚自然饒'],
    blessing: '平安是福，勤勞致富。'
  }
];
