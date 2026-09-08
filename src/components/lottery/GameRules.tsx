import type { ReactNode } from 'react';

interface GameRulesProps {
  title?: string;
  children: ReactNode;
}

export function GameRules({ title = '玩法說明', children }: GameRulesProps) {
  return (
    <details className="w-full rounded-xl border border-yellow-500/20 bg-red-950/30 px-3 py-2 text-left text-yellow-100/80">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold tracking-wide text-yellow-100">
        {title}
      </summary>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-yellow-100/85">{children}</div>
    </details>
  );
}
