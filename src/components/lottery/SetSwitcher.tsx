import { useRef } from 'react';
import { SET_CATEGORY_LABELS, setCategoryLabel } from '../../constants';

interface SetSwitcherProps {
  count: number;
  activeIndex: number;
  onChange: (index: number) => void;
  tabIdPrefix: string;
  panelId: string;
  disabled?: boolean;
}

export function SetSwitcher({
  count,
  activeIndex,
  onChange,
  tabIdPrefix,
  panelId,
  disabled = false,
}: SetSwitcherProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const safeCount = Math.max(1, Math.min(count, SET_CATEGORY_LABELS.length));

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-xs font-bold tracking-wide text-yellow-200/85">檢視組別</p>
      <div
        role="tablist"
        aria-label="檢視選號組別"
        className="grid grid-cols-5 gap-1"
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          const delta = event.key === 'ArrowRight' ? 1 : -1;
          const next = (activeIndex + delta + safeCount) % safeCount;
          onChange(next);
          tabRefs.current[next]?.focus();
        }}
      >
        {Array.from({ length: safeCount }, (_, index) => {
          const selected = index === activeIndex;
          const label = setCategoryLabel(index);
          return (
            <button
              key={label}
              id={`${tabIdPrefix}-${index}`}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(index)}
              className={`flex min-h-11 items-center justify-center rounded-xl border px-1 text-sm font-black ${
                selected
                  ? 'border-yellow-400 bg-yellow-500/35 text-yellow-50 shadow-[0_0_12px_rgba(250,204,21,0.25)]'
                  : 'border-yellow-500/20 bg-red-950/50 text-yellow-200/70 hover:border-yellow-500/40 hover:text-yellow-100'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-yellow-100/75" aria-live="polite">
        目前顯示：{setCategoryLabel(activeIndex)}
      </p>
    </div>
  );
}
