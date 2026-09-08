import { PRESET_LIMIT } from '../constants';
import type { CustomPreset } from '../types';
import { createId } from './history';

export const PRESET_KEY = 'lottery_custom_presets';

function isPreset(raw: unknown): raw is CustomPreset {
  if (typeof raw !== 'object' || raw === null) return false;
  const item = raw as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.min === 'number' &&
    typeof item.max === 'number' &&
    typeof item.count === 'number'
  );
}

export function parsePresets(raw: string | null): CustomPreset[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPreset).slice(0, PRESET_LIMIT);
  } catch {
    return [];
  }
}

export function serializePresets(items: CustomPreset[]): string {
  return JSON.stringify(items.slice(0, PRESET_LIMIT));
}

export function loadPresets(): CustomPreset[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    return parsePresets(localStorage.getItem(PRESET_KEY));
  } catch {
    return [];
  }
}

export function savePresets(items: CustomPreset[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PRESET_KEY, serializePresets(items));
}

export function createPreset(
  name: string,
  min: number,
  max: number,
  count: number,
): CustomPreset {
  return { id: createId(), name: name.trim() || '未命名規則', min, max, count };
}
