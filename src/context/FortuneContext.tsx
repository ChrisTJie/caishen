import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { FortunePoem } from '../types';

interface FortuneContextValue {
  poem: FortunePoem | null;
  setPoem: (poem: FortunePoem | null) => void;
}

const FortuneContext = createContext<FortuneContextValue | null>(null);

export function FortuneProvider({ children }: { children: ReactNode }) {
  const [poem, setPoem] = useState<FortunePoem | null>(null);
  const value = useMemo(() => ({ poem, setPoem }), [poem]);
  return <FortuneContext.Provider value={value}>{children}</FortuneContext.Provider>;
}

export function useFortune() {
  const context = useContext(FortuneContext);
  if (!context) {
    throw new Error('useFortune 必須在 FortuneProvider 內使用');
  }
  return context;
}
