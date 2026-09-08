import { useCallback, useEffect, useState } from 'react';
import { HISTORY_LIMIT } from '../constants';
import { loadHistory, saveHistory, createId } from '../lib/history';
import type { FortunePoem, HistoryItem, NumberSet } from '../types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addToHistory = useCallback(
    (gameName: string, sets: NumberSet[], fortune?: FortunePoem | null) => {
      const item: HistoryItem = {
        id: createId(),
        gameName,
        timestamp: Date.now(),
        source: 'random',
        sets,
        fortuneTitle: fortune?.title,
        fortuneLevel: fortune?.level,
      };
      setHistory((prev) => [item, ...prev].slice(0, HISTORY_LIMIT));
    },
    [],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
