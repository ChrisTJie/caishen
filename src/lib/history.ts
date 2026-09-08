import { HISTORY_LIMIT } from '../constants';
import type { FortuneLevel, HistoryItem, NumberSet } from '../types';

export const HISTORY_KEY = 'lottery_history';

const FORTUNE_LEVELS: FortuneLevel[] = ['大吉', '中吉', '小吉', '吉'];

function toNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((n): n is number => typeof n === 'number' && Number.isFinite(n));
}

function isFortuneLevel(value: unknown): value is FortuneLevel {
  return typeof value === 'string' && FORTUNE_LEVELS.includes(value as FortuneLevel);
}

function normalizeSet(raw: unknown): NumberSet | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const item = raw as Record<string, unknown>;
  const zoneA = toNumberArray(item.zoneA);
  if (zoneA.length === 0) return null;
  const zoneB = item.zoneB === undefined ? undefined : toNumberArray(item.zoneB);
  return { zoneA, zoneB: zoneB && zoneB.length > 0 ? zoneB : undefined };
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeHistoryItem(raw: unknown): HistoryItem | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.id !== 'string' || typeof item.gameName !== 'string') return null;

  let sets: NumberSet[] = [];
  if (Array.isArray(item.sets)) {
    sets = item.sets.map(normalizeSet).filter((set): set is NumberSet => set !== null);
  } else {
    const fallback = normalizeSet(item);
    if (fallback) sets = [fallback];
  }
  if (sets.length === 0) return null;

  return {
    id: item.id,
    gameName: item.gameName,
    timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
    source: 'random',
    sets,
    fortuneTitle: typeof item.fortuneTitle === 'string' ? item.fortuneTitle : undefined,
    fortuneLevel: isFortuneLevel(item.fortuneLevel) ? item.fortuneLevel : undefined,
  };
}

export function parseHistory(raw: string | null): HistoryItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeHistoryItem)
      .filter((item): item is HistoryItem => item !== null)
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function serializeHistory(items: HistoryItem[]): string {
  return JSON.stringify(items.slice(0, HISTORY_LIMIT));
}

export function loadHistory(): HistoryItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return parseHistory(localStorage.getItem(HISTORY_KEY));
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, serializeHistory(items));
}
