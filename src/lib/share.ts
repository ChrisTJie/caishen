import { setCategoryLabel } from '../constants';
import type { NumberSet } from '../types';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export function formatShareText(options: {
  gameName: string;
  sets: NumberSet[];
  fortune?: { title: string; level: string } | null;
}): string {
  const lines = [`【發財靈籤】我在 ${options.gameName} 抽到了發財號碼：`];
  options.sets.forEach((set, index) => {
    const prefix = options.sets.length > 1 ? `${setCategoryLabel(index)}：` : '';
    const zoneA = `${prefix}A區：${set.zoneA.join(', ')}`;
    lines.push(set.zoneB && set.zoneB.length > 0 ? `${zoneA}  B區：${set.zoneB.join(', ')}` : zoneA);
  });
  if (options.fortune) {
    lines.push(`靈籤：${options.fortune.title}（${options.fortune.level}）`);
  }
  lines.push('祝大家財源廣進！僅供娛樂參考。');
  return lines.join('\n');
}

export async function shareLotteryResult(
  text: string,
  title = '發財靈籤',
): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
