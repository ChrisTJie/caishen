import { useMemo, useRef, useState } from 'react';
import type { HistoryItem } from '../../types';
import { setCategoryLabel } from '../../constants';
import { countHits, parseNumberList } from '../../lib/lottery';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { motion } from 'framer-motion';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
  onClose: () => void;
}

export function HistoryPanel({ history, onClear, onClose }: HistoryPanelProps) {
  const [checkInput, setCheckInput] = useState('');
  const [checkInputB, setCheckInputB] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const winningA = useMemo(() => parseNumberList(checkInput), [checkInput]);
  const winningB = useMemo(() => parseNumberList(checkInputB), [checkInputB]);

  useLockBodyScroll(true);
  useFocusTrap(true, panelRef, onClose);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 z-[120] flex h-full w-full max-w-full flex-col border-l border-yellow-500/30 bg-gradient-to-b from-[#4a0808] to-[#2a0505] shadow-2xl outline-none sm:max-w-sm"
      >
        <div className="flex h-full min-h-0 flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-yellow-100 sm:px-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="mb-4 flex items-center justify-between border-b border-yellow-500/20 pb-4 sm:mb-6">
            <h2
              id="history-title"
              className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-xl font-black tracking-wide text-transparent sm:text-2xl sm:tracking-widest"
            >
              歷史紀錄
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉歷史紀錄"
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-yellow-100/80 transition-colors hover:text-yellow-400"
            >
              ✕
            </button>
          </div>

          <div className="mb-4 rounded-xl border border-yellow-500/15 bg-red-950/40 p-3">
            <p className="mb-2 text-sm font-bold text-yellow-200">手動對獎</p>
            <label className="mb-2 block text-xs text-yellow-100/70">
              A 區開獎號碼
              <input
                type="text"
                value={checkInput}
                onChange={(event) => setCheckInput(event.target.value)}
                placeholder="例如 03, 12, 18, 22, 31, 40"
                className="mt-1 min-h-11 w-full rounded-lg border border-yellow-500/20 bg-red-950/60 px-3 py-2 font-mono text-base text-yellow-100 focus:border-yellow-500/50 focus:outline-none"
              />
            </label>
            <label className="block text-xs text-yellow-100/70">
              B 區（選填）
              <input
                type="text"
                value={checkInputB}
                onChange={(event) => setCheckInputB(event.target.value)}
                placeholder="例如 08"
                className="mt-1 min-h-11 w-full rounded-lg border border-yellow-500/20 bg-red-950/60 px-3 py-2 font-mono text-base text-yellow-100 focus:border-yellow-500/50 focus:outline-none"
              />
            </label>
            <p className="mt-2 text-[11px] text-yellow-100/50">請自行輸入開獎號碼，本程式不連線官方資料。</p>
          </div>

          <div className="custom-scrollbar min-h-0 flex-grow space-y-4 overflow-y-auto pr-2">
            {history.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center opacity-40">
                <span className="mb-2 text-4xl" aria-hidden="true">
                  📜
                </span>
                <p>尚無發財紀錄</p>
              </div>
            ) : (
              history.map((item) => (
                <article key={item.id} className="rounded-xl border border-yellow-500/10 bg-red-950/40 p-4 shadow-inner">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-sm font-bold text-yellow-500/80">{item.gameName}</span>
                    <span className="text-right font-mono text-[10px] opacity-40">
                      {new Date(item.timestamp).toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </span>
                  </div>
                  {item.fortuneTitle ? (
                    <p className="mb-2 text-xs text-yellow-200/70">
                      靈籤：{item.fortuneTitle}
                      {item.fortuneLevel ? ` · ${item.fortuneLevel}` : ''}
                    </p>
                  ) : null}
                  <div className="space-y-3">
                    {item.sets.map((set, setIndex) => {
                      const hitsA = winningA.length ? countHits(set.zoneA, winningA) : 0;
                      const hitsB = set.zoneB && winningB.length ? countHits(set.zoneB, winningB) : 0;
                      return (
                        <div key={`${item.id}-${setIndex}`}>
                          {item.sets.length > 1 ? (
                            <p className="mb-1 text-[11px] font-bold text-yellow-200/80">
                              {setCategoryLabel(setIndex)}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-2">
                            {set.zoneA.map((n) => (
                              <span
                                key={`a-${n}`}
                                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                                  winningA.includes(n)
                                    ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100'
                                    : 'border-yellow-500/30 bg-yellow-500/10'
                                }`}
                              >
                                {String(n).padStart(2, '0')}
                              </span>
                            ))}
                            {set.zoneB?.map((n) => (
                              <span
                                key={`b-${n}`}
                                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                                  winningB.includes(n)
                                    ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100'
                                    : 'border-red-500/30 bg-red-500/20 text-red-200'
                                }`}
                              >
                                {String(n).padStart(2, '0')}
                              </span>
                            ))}
                          </div>
                          {winningA.length > 0 || winningB.length > 0 ? (
                            <p className="mt-1 text-[11px] text-yellow-200/80">
                              命中 A 區 {hitsA} 顆
                              {set.zoneB ? `、B 區 ${hitsB} 顆` : ''}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-4 shrink-0 border-t border-yellow-500/20 pt-4">
            <button
              type="button"
              onClick={onClear}
              disabled={history.length === 0}
              className="min-h-11 w-full rounded-xl border border-red-500/50 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-30"
            >
              清除所有紀錄
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
